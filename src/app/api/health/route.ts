import { prisma } from "@/lib/db";
import { checkR2, r2Enabled, R2_BUCKET } from "@/lib/r2";
import { logger } from "@/lib/logger";
import { mailTransport, mailerConfigured } from "@/lib/mailer";
import {
  emailVerificationEnforced,
  emailVerificationMisconfigured,
} from "@/lib/email-verification";
import { reportAlertsConfigured, reportWebhookConfigured } from "@/lib/notify";

/**
 * Liveness plus a configuration read-out.
 *
 * The env-only fields answer "did this deploy get its secrets?" without a
 * network call. `?deep=1` additionally proves the R2 credentials sign a real
 * request — the check worth running once after a deploy, since presence of the
 * three R2 variables says nothing about whether they are correct.
 *
 * Only `db` affects the status code. A missing mail transport degrades features
 * but the forum still serves, and returning 503 for it would take the site out
 * of a load balancer for no reason.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const started = Date.now();
  const deep = new URL(request.url).searchParams.get("deep") === "1";
  let dbOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    logger.error("health: db check failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  let r2Live: { ok: boolean; reason?: string } | null = null;
  if (deep) {
    const res = await checkR2();
    r2Live = res.ok ? { ok: true } : { ok: false, reason: res.reason };
  }

  const body = {
    ok: dbOk,
    db: dbOk,
    // Env-only, as before: true means the three R2 variables are set.
    r2: r2Enabled,
    r2Bucket: r2Enabled ? R2_BUCKET : null,
    // Present only with ?deep=1 — an actual HeadBucket against Cloudflare.
    r2Live,
    mail: mailerConfigured,
    mailTransport,
    reportAlerts: reportAlertsConfigured,
    reportWebhook: reportWebhookConfigured,
    emailVerificationEnforced,
    // True when REQUIRE_EMAIL_VERIFICATION is on but no mail transport exists,
    // so enforcement has been force-disabled to avoid locking members out.
    emailVerificationMisconfigured,
    authSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    uptime: process.uptime(),
    latencyMs: Date.now() - started,
  };

  if (!dbOk) {
    logger.warn("health: degraded", body);
  }

  return Response.json(body, {
    status: dbOk ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
