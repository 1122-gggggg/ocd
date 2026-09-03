import { timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/logger";
import { prunePasswordResetTokens } from "@/lib/password";
import { pruneVerificationTokens } from "@/lib/email-verification";
import { pruneRateLimitCounters } from "@/lib/rate-limit-db";
import { sendReportBacklogDigest } from "@/lib/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Nightly housekeeping — triggered by the `crons` entry in vercel.json.
 *
 * Three jobs, each independent:
 *
 * 1. Drop spent and expired reset / verification tokens. Keeping a redeemed
 *    reset hash around forever is a liability with no upside.
 * 2. Drop rate-limit windows that can no longer influence a verdict. The table
 *    is small but grows without bound (one row per IP per hour) if left alone.
 * 3. Re-send alerts for any open report that was never successfully notified —
 *    the catch-up for a mail outage, or for reports filed before alerts were
 *    configured at all.
 *
 * Shares CRON_SECRET with the backup route. Unlike backups this is not
 * sensitive to read, but an unauthenticated endpoint that sends mail is a spam
 * vector, so it fails closed the same way.
 */

function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const a = Buffer.from(header.slice(prefix.length));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const started = Date.now();

  if (!process.env.CRON_SECRET) {
    logger.error("cron/maintenance: CRON_SECRET is not set — refusing to run");
    return Response.json(
      { ok: false, error: "CRON_SECRET_NOT_CONFIGURED" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  if (!isAuthorized(request)) {
    logger.warn("cron/maintenance: unauthorized request");
    return Response.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  // Settled, not all-or-nothing: a failing digest must not stop the pruning.
  const [resets, verifications, rateWindows, digest] = await Promise.allSettled([
    prunePasswordResetTokens(),
    pruneVerificationTokens(),
    pruneRateLimitCounters(),
    sendReportBacklogDigest(),
  ]);

  const value = (r: PromiseSettledResult<number>) =>
    r.status === "fulfilled" ? r.value : null;

  const result = {
    ok: true,
    prunedPasswordResetTokens: value(resets),
    prunedVerificationTokens: value(verifications),
    prunedRateLimitWindows: value(rateWindows),
    reportsInDigest: value(digest),
    failures: [resets, verifications, rateWindows, digest]
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => String(r.reason).slice(0, 200)),
    durationMs: Date.now() - started,
  };

  if (result.failures.length > 0) {
    logger.error("cron/maintenance: partial failure", result);
  } else {
    logger.info("cron/maintenance: completed", result);
  }

  return Response.json(result, { headers: { "cache-control": "no-store" } });
}
