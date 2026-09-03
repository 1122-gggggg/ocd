import { timingSafeEqual } from "node:crypto";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";
import { r2, r2Enabled, R2_BUCKET } from "@/lib/r2";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Short probe budget so /api/health never hangs on Cloudflare. */
const R2_PROBE_TIMEOUT_MS = 3000;

const APP_VERSION = process.env.APP_VERSION ?? "0.1.0";

/**
 * Deep details are gated behind CRON_SECRET. Two accepted shapes:
 * - `Authorization: Bearer $CRON_SECRET` (Vercel cron style), or
 * - `?deep=1` with `?secret=$CRON_SECRET` (manual operator check).
 * Anything else gets the minimal public body `{ ok, latencyMs }`.
 */
function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (header.startsWith(prefix)) {
    const provided = header.slice(prefix.length);
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }

  try {
    const url = new URL(request.url);
    // Allow `?deep=<secret>` as well as `?secret=` / `?cronSecret=`.
    const candidates = [
      url.searchParams.get("secret"),
      url.searchParams.get("cronSecret"),
      url.searchParams.get("deep"),
    ];
    for (const c of candidates) {
      if (!c || c === "1") continue;
      const a = Buffer.from(c);
      const b = Buffer.from(expected);
      if (a.length === b.length && timingSafeEqual(a, b)) return true;
    }
  } catch {
    // Malformed URL — treat as unauthorized.
  }
  return false;
}

/** Live HeadBucket probe with a short timeout. Fail-open: caller decides status. */
async function checkR2Live(): Promise<{ ok: boolean; reason?: string }> {
  if (!r2) return { ok: false, reason: "NOT_CONFIGURED" };
  try {
    const probe = r2.send(new HeadBucketCommand({ Bucket: R2_BUCKET }));
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`timeout after ${R2_PROBE_TIMEOUT_MS}ms`)),
        R2_PROBE_TIMEOUT_MS,
      ),
    );
    await Promise.race([probe, timeout]);
    return { ok: true };
  } catch (err) {
    const e = err as {
      name?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number };
    };
    const status = e.$metadata?.httpStatusCode;
    return {
      ok: false,
      reason: `${e.name ?? "Error"}${status ? ` (HTTP ${status})` : ""}: ${(e.message ?? "").slice(0, 200)}`,
    };
  }
}

/** Applied-migration count from Prisma's bookkeeping table; null when unreadable. */
async function getMigrationCount(): Promise<number | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count FROM _prisma_migrations
    `;
    const n = Number(rows?.[0]?.count);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const started = Date.now();
  let dbOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    logger.error("health: db check failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const noStore = { "cache-control": "no-store" } as const;

  // Public: minimal body, no internals.
  if (!isAuthorized(request)) {
    if (!dbOk) logger.warn("health: degraded", { db: dbOk });
    return Response.json(
      { ok: dbOk, latencyMs: Date.now() - started },
      { status: dbOk ? 200 : 503, headers: noStore },
    );
  }

  // Authed deep check: live R2 probe + migration count. R2 failure is
  // fail-open (reported as r2Live.ok false, never flips the status code).
  const [r2Live, migrations] = await Promise.all([
    checkR2Live(),
    getMigrationCount(),
  ]);

  const body = {
    ok: dbOk,
    latencyMs: Date.now() - started,
    db: dbOk,
    r2: r2Enabled,
    r2Live,
    migrations,
    uptime: process.uptime(),
    version: APP_VERSION,
  };

  if (!dbOk) {
    logger.warn("health: degraded", {
      db: dbOk,
      r2LiveOk: r2Live.ok,
      migrations,
    });
  }

  return Response.json(body, {
    status: dbOk ? 200 : 503,
    headers: noStore,
  });
}
