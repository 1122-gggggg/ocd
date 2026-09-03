import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { gzipSync } from "node:zlib";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";
import { r2, r2Enabled, R2_BACKUP_BUCKET } from "@/lib/r2";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Nightly logical backup — triggered by the `crons` entry in vercel.json.
 *
 * Why JSON and not pg_dump: `scripts/backup/neon-to-r2.sh` shells out to
 * pg_dump / gzip / aws, none of which exist in a Vercel serverless function.
 * This route produces a Prisma-level dump of every durable table instead and
 * writes it beside the shell script's output, using a distinct extension so
 * the two never collide:
 *
 *   backups/neon-YYYYMMDD.sql.gz    <- scripts/backup/neon-to-r2.sh (manual/CI)
 *   backups/logical-YYYYMMDD.json.gz <- this route (automatic, nightly)
 *
 * Session and VerificationToken are deliberately excluded: sessions are JWTs
 * (see auth.config.ts) so those rows are ephemeral and worthless to restore.
 *
 * The dump contains emails and bcrypt password hashes — everything a real
 * backup needs to restore accounts. Keep the R2 bucket private.
 */

/** Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set. */
function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;

  const provided = header.slice(prefix.length);
  if (!provided) return false;
  // Compare SHA-256 digests (fixed 32 bytes) so timingSafeEqual never throws
  // and response timing reveals nothing about the secret's length.
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Page size for chunked table dumps — bounds memory on large tables. */
const BACKUP_PAGE_SIZE = 1000;

/** Dump every row of a table in id-ordered cursor pages (full fields kept). */
async function dumpAll<T extends { id: string }>(
  query: (args: {
    take: number;
    skip?: number;
    cursor?: { id: string };
    orderBy: { id: "asc" };
  }) => Promise<T[]>,
): Promise<T[]> {
  const out: T[] = [];
  let cursor: { id: string } | undefined;
  for (;;) {
    const page = await query(
      cursor
        ? { take: BACKUP_PAGE_SIZE, skip: 1, cursor, orderBy: { id: "asc" } }
        : { take: BACKUP_PAGE_SIZE, orderBy: { id: "asc" } },
    );
    out.push(...page);
    if (page.length < BACKUP_PAGE_SIZE) break;
    cursor = { id: page[page.length - 1]!.id };
  }
  return out;
}

function backupKey(now: Date): string {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(4).toString("hex");
  return `backups/logical-${stamp}-${suffix}.json.gz`;
}

export async function GET(request: Request) {
  const started = Date.now();

  if (!process.env.CRON_SECRET) {
    // Fail closed: an unauthenticated full-database dump must never be reachable.
    logger.error("cron/backup: CRON_SECRET is not set — refusing to run");
    return Response.json(
      { ok: false, error: "CRON_SECRET_NOT_CONFIGURED" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  if (!isAuthorized(request)) {
    logger.warn("cron/backup: unauthorized request");
    return Response.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  if (!r2Enabled || !r2) {
    logger.error("cron/backup: R2 is not configured — nothing to upload to");
    return Response.json(
      { ok: false, error: "STORAGE_NOT_CONFIGURED" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  try {
    const [
      users,
      accounts,
      boards,
      boardApplications,
      clinicianApplications,
      posts,
      replies,
      reports,
    ] = await Promise.all([
      dumpAll((args) => prisma.user.findMany(args)),
      dumpAll((args) => prisma.account.findMany(args)),
      dumpAll((args) => prisma.board.findMany(args)),
      dumpAll((args) => prisma.boardApplication.findMany(args)),
      dumpAll((args) => prisma.clinicianApplication.findMany(args)),
      dumpAll((args) => prisma.post.findMany(args)),
      dumpAll((args) => prisma.reply.findMany(args)),
      dumpAll((args) => prisma.report.findMany(args)),
    ]);

    const now = new Date();
    const payload = {
      meta: {
        format: "ocd-logical-backup",
        version: 1,
        takenAt: now.toISOString(),
        excludes: ["Session", "VerificationToken"],
      },
      users,
      accounts,
      boards,
      boardApplications,
      clinicianApplications,
      posts,
      replies,
      reports,
    };

    const counts = {
      users: users.length,
      accounts: accounts.length,
      boards: boards.length,
      boardApplications: boardApplications.length,
      clinicianApplications: clinicianApplications.length,
      posts: posts.length,
      replies: replies.length,
      reports: reports.length,
    };

    const body = gzipSync(Buffer.from(JSON.stringify(payload), "utf8"));
    const key = backupKey(now);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BACKUP_BUCKET,
        Key: key,
        Body: body,
        ContentType: "application/json",
        ContentEncoding: "gzip",
      })
    );

    const result = {
      ok: true,
      key,
      bytes: body.byteLength,
      counts,
      durationMs: Date.now() - started,
    };
    logger.info("cron/backup: uploaded", result);

    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    logger.error("cron/backup: failed", {
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - started,
    });
    return Response.json(
      { ok: false, error: "BACKUP_FAILED" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
