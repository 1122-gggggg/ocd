import { createHash, timingSafeEqual } from "node:crypto";
import { notifyRescuePosts } from "@/lib/rescue";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

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

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    // Fail closed: unauthenticated notification writes must never be reachable.
    logger.error("cron/rescue: CRON_SECRET is not set — refusing to run");
    return Response.json(
      { ok: false, error: "CRON_SECRET_NOT_CONFIGURED" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  if (!isAuthorized(request)) {
    logger.warn("cron/rescue: unauthorized request");
    return Response.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  try {
    const notified = await notifyRescuePosts();
    const result = { ok: true, notified };
    logger.info("cron/rescue: notified", result);
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    logger.error("cron/rescue: failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { ok: false, error: "RESCUE_FAILED" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
