import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendMail, mailerConfigured } from "@/lib/mailer";
import { reportAlertEmail } from "@/lib/email-templates";
import { containsCrisisKeyword } from "@/lib/crisis-keywords";
import { siteUrlFromEnv } from "@/lib/site-url";

/**
 * Moderation alerts.
 *
 * Reports used to sit silently in /admin/reports until someone happened to look.
 * On a mental-health forum the gap between "posted" and "seen" is the whole
 * risk, so every new report now pushes out immediately over two independent
 * channels, and neither one failing stops the other:
 *
 * - **Email** to `ADMIN_ALERT_EMAIL` (comma-separated), or to every ADMIN
 *   account with an address if that is unset.
 * - **Webhook** to `REPORT_WEBHOOK_URL` — Slack and Discord incoming webhooks
 *   both work as-is, because the payload carries `text` *and* `content` and
 *   each service reads the key it knows and ignores the other.
 *
 * Alerts are best-effort by design. A report must never fail to be *filed*
 * because a notification could not be *sent*, so every path here swallows its
 * errors into the log.
 */

const WEBHOOK_TIMEOUT_MS = 5_000;

export const reportWebhookConfigured = !!process.env.REPORT_WEBHOOK_URL;
export const reportAlertsConfigured = mailerConfigured || reportWebhookConfigured;

async function adminRecipients(): Promise<string[]> {
  const configured = (process.env.ADMIN_ALERT_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured;

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", email: { not: null }, isSystem: false },
    select: { email: true },
  });
  return admins.map((a) => a.email!).filter(Boolean);
}

async function postWebhook(text: string): Promise<void> {
  const url = process.env.REPORT_WEBHOOK_URL;
  if (!url) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // `text` is Slack's field, `content` is Discord's. Sending both keeps one
      // env var working for either service without a provider setting.
      body: JSON.stringify({ text, content: text }),
      signal: controller.signal,
    });
    if (!res.ok) {
      logger.error("notify: report webhook rejected", { status: res.status });
    }
  } catch (err) {
    logger.error("notify: report webhook failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Body text of the reported item, for crisis-keyword screening only. */
async function targetBody(targetType: string, targetId: string): Promise<string> {
  if (targetType === "POST") {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { title: true, bodyMd: true },
    });
    return post ? `${post.title}\n${post.bodyMd}` : "";
  }
  const reply = await prisma.reply.findUnique({
    where: { id: targetId },
    select: { bodyMd: true },
  });
  return reply?.bodyMd ?? "";
}

/**
 * Alert admins about one report. Marks `notifiedAt` on success of *either*
 * channel so the nightly digest does not repeat it.
 */
export async function notifyNewReport(reportId: string): Promise<void> {
  if (!reportAlertsConfigured) {
    logger.warn("notify: report filed but no alert channel configured", { reportId });
    return;
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, targetType: true, targetId: true, reason: true },
    });
    if (!report) return;

    const [openCount, body] = await Promise.all([
      prisma.report.count({ where: { status: "OPEN" } }),
      targetBody(report.targetType, report.targetId),
    ]);
    const crisis = containsCrisisKeyword(body);
    const adminUrl = `${siteUrlFromEnv()}/admin/reports`;
    // Reasons are member-written free text; truncate so one long report cannot
    // blow up a webhook payload or a subject line.
    const reason = report.reason.slice(0, 300);

    let delivered = false;

    const recipients = mailerConfigured ? await adminRecipients() : [];
    if (recipients.length === 0 && mailerConfigured) {
      logger.warn("notify: mail configured but no admin recipients resolved", { reportId });
    }
    for (const to of recipients) {
      const res = await sendMail(
        reportAlertEmail(to, {
          count: openCount,
          targetType: report.targetType,
          reason,
          adminUrl,
          crisis,
        }),
      );
      if (res.ok) delivered = true;
    }

    if (reportWebhookConfigured) {
      const label = report.targetType === "POST" ? "貼文" : "回覆";
      await postWebhook(
        `${crisis ? "⚠️ *可能涉及危機內容* " : ""}新舉報（${label}）\n理由：${reason}\n待處理：${openCount} 件\n${adminUrl}`,
      );
      delivered = true;
    }

    if (delivered) {
      await prisma.report.update({
        where: { id: reportId },
        data: { notifiedAt: new Date() },
      });
    }
  } catch (err) {
    logger.error("notify: report alert failed", {
      reportId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Catch-up sweep for anything the instant alert missed (mail outage, cold
 * webhook, a report filed before alerts were configured). Run from the nightly
 * cron; sends one summary rather than one message per report.
 */
export async function sendReportBacklogDigest(): Promise<number> {
  if (!reportAlertsConfigured) return 0;

  const pending = await prisma.report.findMany({
    where: { status: "OPEN", notifiedAt: null },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { id: true, targetType: true, reason: true, createdAt: true },
  });
  if (pending.length === 0) return 0;

  const adminUrl = `${siteUrlFromEnv()}/admin/reports`;
  const lines = pending.map(
    (r) =>
      `- ${r.createdAt.toISOString().slice(0, 16).replace("T", " ")} ${
        r.targetType === "POST" ? "貼文" : "回覆"
      }：${r.reason.slice(0, 120)}`,
  );
  const text = `有 ${pending.length} 件舉報尚未通知：\n${lines.join("\n")}\n\n${adminUrl}`;

  let delivered = false;
  if (mailerConfigured) {
    for (const to of await adminRecipients()) {
      const res = await sendMail({
        to,
        subject: `[強迫症互助坊] 待處理舉報摘要（${pending.length} 件）`,
        text,
      });
      if (res.ok) delivered = true;
    }
  }
  if (reportWebhookConfigured) {
    await postWebhook(text);
    delivered = true;
  }

  if (delivered) {
    await prisma.report.updateMany({
      where: { id: { in: pending.map((p) => p.id) } },
      data: { notifiedAt: new Date() },
    });
  }
  return pending.length;
}
