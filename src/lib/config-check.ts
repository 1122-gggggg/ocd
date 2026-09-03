import { mailerConfigured, mailTransport } from "@/lib/mailer";
import { r2Enabled } from "@/lib/r2";
import { CONFIGURED_SITE_URL } from "@/lib/site-url";

/**
 * Deployment self-audit — environment only.
 *
 * Every item here is something that silently degrades the site rather than
 * breaking the build: mail that was never wired up, an alert channel nobody
 * configured, a missing cron secret. Those are exactly the failures that stay
 * invisible until a member needs the feature at the worst possible moment, so
 * they are surfaced twice — once in the boot log, once on the admin dashboard.
 *
 * This module deliberately imports nothing that touches the database, so
 * `instrumentation.ts` can call it without opening a connection during boot.
 * The database-backed check lives in `@/lib/admin-password-check`.
 */

export type Severity = "error" | "warn";

export type ConfigIssue = {
  severity: Severity;
  key: string;
  /** What is wrong, in operator terms. */
  message: string;
  /** What to do about it. */
  fix: string;
};

const requireEmailVerificationFlag =
  (process.env.REQUIRE_EMAIL_VERIFICATION ?? "").toLowerCase() === "true";

export function checkEnvConfig(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  const isProd = process.env.NODE_ENV === "production";
  const reportAlerts = mailerConfigured || !!process.env.REPORT_WEBHOOK_URL;

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    issues.push({
      severity: "error",
      key: "AUTH_SECRET",
      message: "AUTH_SECRET 未設定，工作階段無法簽章。",
      fix: "執行 `openssl rand -base64 32` 並設為 AUTH_SECRET。設定後不要再更動，一改全站登出。",
    });
  } else if (secret.length < 32) {
    issues.push({
      severity: "error",
      key: "AUTH_SECRET",
      message: `AUTH_SECRET 只有 ${secret.length} 個字元，強度不足。`,
      fix: "改用 `openssl rand -base64 32` 產生的值（至少 32 字元）。",
    });
  }

  if (!mailerConfigured) {
    issues.push({
      severity: "error",
      key: "MAIL",
      message: "未設定郵件服務：忘記密碼、Email 驗證與舉報通知信都無法寄出。",
      fix: "設定 RESEND_API_KEY + MAIL_FROM，或設定 MAIL_WEBHOOK_URL 接到你自己的寄信服務。",
    });
  }

  if (requireEmailVerificationFlag && !mailerConfigured) {
    issues.push({
      severity: "error",
      key: "REQUIRE_EMAIL_VERIFICATION",
      message:
        "REQUIRE_EMAIL_VERIFICATION=true 但沒有郵件服務，強制驗證已自動關閉，否則沒有人能發文。",
      fix: "先設定郵件服務，或把 REQUIRE_EMAIL_VERIFICATION 移除。",
    });
  }

  if (!reportAlerts) {
    issues.push({
      severity: "warn",
      key: "REPORT_ALERTS",
      message: "舉報沒有任何即時通知管道，只能靠人工進後台查看。",
      fix: "設定 ADMIN_ALERT_EMAIL（需要郵件服務）或 REPORT_WEBHOOK_URL（Slack / Discord webhook）。",
    });
  }

  if (!r2Enabled) {
    issues.push({
      severity: "warn",
      key: "R2",
      message: "R2 未設定：臨床身分驗證的證明上傳與夜間備份都會失敗。",
      fix: "設定 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET，再打 /api/health?deep=1 確認憑證真的可用。",
    });
  }

  if (!process.env.CRON_SECRET) {
    issues.push({
      severity: "warn",
      key: "CRON_SECRET",
      message: "CRON_SECRET 未設定：夜間備份與清理排程會直接拒絕執行。",
      fix: "產生一組隨機字串設為 CRON_SECRET（Vercel Cron 會自動帶上）。",
    });
  }

  if (isProd && !CONFIGURED_SITE_URL) {
    issues.push({
      severity: "warn",
      key: "PUBLIC_SITE_URL",
      message:
        "PUBLIC_SITE_URL 未設定：排程寄出的通知信會用 Vercel 的部署網址組連結，可能指向錯的主機。",
      fix: "設為正式網址，例如 https://ocd.example.tw。",
    });
  }

  return issues;
}

/** One-line summary for the boot log. */
export function configSummary() {
  return {
    mailTransport,
    r2: r2Enabled,
    reportWebhook: !!process.env.REPORT_WEBHOOK_URL,
    requireEmailVerification: requireEmailVerificationFlag,
    publicSiteUrl: CONFIGURED_SITE_URL ?? null,
  };
}
