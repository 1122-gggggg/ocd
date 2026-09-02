import { prisma } from "@/lib/db";
import { r2Enabled } from "@/lib/r2";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
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

  const body = {
    ok: dbOk,
    db: dbOk,
    r2: r2Enabled,
    uptime: process.uptime(),
    latencyMs: Date.now() - started,
  };

  // Use logger for observability without leaking internals to caller
  if (!dbOk) {
    logger.warn("health: degraded", body);
  }

  return Response.json(body, {
    status: dbOk ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
