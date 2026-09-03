import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit, estimateSlidingWindow } from "@/lib/rate-limit";

/**
 * Cross-instance rate limiting backed by Postgres.
 *
 * The in-memory limiter in `@/lib/rate-limit` is per-instance: on Vercel every
 * serverless invocation may land on a fresh isolate, so opening several
 * connections walks straight past it. This module closes that hole using the
 * database both instances already share, with no Redis to operate.
 *
 * ## Algorithm
 * Sliding-window *approximation* over two fixed windows, the same trick
 * Cloudflare documents for its own limiter. One row per (bucket, window):
 *
 *     estimated = previousWindowCount x (fraction of previous window still in
 *                 view) + currentWindowCount
 *
 * That costs a single round trip — the CTE below upserts the current window and
 * reads the previous one at once — and avoids the 2x burst you get at the
 * boundary of a naive fixed window.
 *
 * ## Failure policy
 * If the query fails the request is **not** blocked: the in-memory limiter has
 * already run and still applies. A hard fail-closed would take the whole site
 * down with the database, which is the wrong trade for a support forum.
 */

export type RateVerdict = {
  allowed: boolean;
  /** Estimated hits in the trailing window, including this one. */
  estimated: number;
  limit: number;
  /** Milliseconds until the current window rolls over. */
  resetMs: number;
  /** Whether the shared counter was actually consulted. */
  durable: boolean;
};

type Row = { cur: bigint | number; prev: bigint | number };

function windowStart(now: number, windowMs: number): number {
  return Math.floor(now / windowMs) * windowMs;
}

/**
 * Consume one unit from the shared counter.
 *
 * Both the local and the shared limiter are consulted; the request is allowed
 * only if both agree. `bucket` should already be scoped, e.g.
 * `register:ip:1.2.3.4` or `createPost:user:abc123`.
 */
export async function enforceRateLimit(
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<RateVerdict> {
  const now = Date.now();
  const curStart = windowStart(now, windowMs);
  const prevStart = curStart - windowMs;
  const elapsed = now - curStart;
  const resetMs = windowMs - elapsed;

  // Per-instance gate first: it is free and catches the common single-client
  // burst before we spend a database round trip on it.
  const localAllowed = checkRateLimit(bucket, limit, windowMs);

  try {
    const rows = await prisma.$queryRaw<Row[]>(Prisma.sql`
      WITH upsert AS (
        INSERT INTO "RateLimitCounter" ("id", "bucket", "windowStart", "count", "expiresAt")
        VALUES (
          ${`${bucket}:${curStart}`},
          ${bucket},
          ${new Date(curStart)},
          1,
          ${new Date(curStart + windowMs * 2)}
        )
        ON CONFLICT ("id") DO UPDATE SET "count" = "RateLimitCounter"."count" + 1
        RETURNING "count"
      )
      SELECT
        (SELECT "count" FROM upsert) AS cur,
        COALESCE(
          (SELECT "count" FROM "RateLimitCounter" WHERE "id" = ${`${bucket}:${prevStart}`}),
          0
        ) AS prev
    `);

    const row = rows[0];
    const cur = Number(row?.cur ?? 1);
    const prev = Number(row?.prev ?? 0);
    const estimated = estimateSlidingWindow(prev, cur, elapsed, windowMs);

    return {
      allowed: localAllowed && estimated <= limit,
      estimated,
      limit,
      resetMs,
      durable: true,
    };
  } catch (err) {
    logger.warn("rate-limit: shared counter unavailable, using local window", {
      bucket,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      allowed: localAllowed,
      estimated: localAllowed ? 1 : limit + 1,
      limit,
      resetMs,
      durable: false,
    };
  }
}

/** Convenience wrapper for call sites that only need the boolean. */
export async function allowRequest(
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  return (await enforceRateLimit(bucket, limit, windowMs)).allowed;
}

/**
 * Drop windows that can no longer influence a verdict. Called by the nightly
 * cron; the table is tiny but unbounded without this.
 */
export async function pruneRateLimitCounters(): Promise<number> {
  try {
    const res = await prisma.rateLimitCounter.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return res.count;
  } catch (err) {
    logger.error("rate-limit: prune failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return 0;
  }
}
