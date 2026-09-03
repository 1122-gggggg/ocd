import type { MailMessage } from "@/lib/mailer";

/**
 * Email bodies. Deliberately plain: no images, no tracking pixels, no external
 * CSS. This is a mental-health community — mail that lands in someone's inbox
 * should say as little about why as it can while still being useful, so subject
 * lines avoid the words "OCD" / "強迫症" beyond the site's own name.
 */

const SITE_NAME = "強迫症互助坊";

function shell(title: string, lines: string[], cta?: { label: string; url: string }): string {
  const body = lines
    .map((l) => `<p style="margin:0 0 12px;line-height:1.7">${escapeHtml(l)}</p>`)
    .join("");
  const button = cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="background:#2f6f6b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${escapeHtml(cta.label)}</a></p>
       <p style="margin:0 0 12px;font-size:13px;color:#666;line-height:1.6">按鈕無法點擊時，請複製以下網址貼到瀏覽器：<br><span style="word-break:break-all">${escapeHtml(cta.url)}</span></p>`
    : "";
  return `<div style="font-family:system-ui,-apple-system,'Noto Sans TC',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1c1c1c">
  <h1 style="font-size:18px;margin:0 0 16px">${escapeHtml(title)}</h1>
  ${body}${button}
  <hr style="border:0;border-top:1px solid #e5e5e5;margin:24px 0">
  <p style="font-size:12px;color:#888;margin:0;line-height:1.6">此信由 ${SITE_NAME} 自動寄出，請勿直接回覆。</p>
</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function passwordResetEmail(to: string, url: string, ttlMinutes: number): MailMessage {
  const lines = [
    "我們收到重設密碼的請求。",
    `請在 ${ttlMinutes} 分鐘內點擊下方連結設定新密碼，連結只能使用一次。`,
    "如果這不是你本人的操作，請忽略這封信，你的密碼不會有任何變動。",
  ];
  return {
    to,
    subject: `${SITE_NAME}：重設密碼`,
    text: `${lines.join("\n\n")}\n\n${url}\n`,
    html: shell("重設密碼", lines, { label: "設定新密碼", url }),
  };
}

export function verifyEmailEmail(to: string, url: string, ttlHours: number): MailMessage {
  const lines = [
    "請驗證這個 Email 是你本人的，才能在忘記密碼時把帳號找回來。",
    `連結有效期限為 ${ttlHours} 小時，只能使用一次。`,
    "如果你沒有註冊過這個網站，請忽略這封信。",
  ];
  return {
    to,
    subject: `${SITE_NAME}：驗證你的 Email`,
    text: `${lines.join("\n\n")}\n\n${url}\n`,
    html: shell("驗證你的 Email", lines, { label: "驗證 Email", url }),
  };
}

export function passwordChangedEmail(to: string, when: Date): MailMessage {
  const stamp = when.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  const lines = [
    `你的密碼已於 ${stamp}（台北時間）變更。`,
    "如果這不是你本人的操作，請立即再次使用「忘記密碼」重設，並聯絡站務。",
  ];
  return {
    to,
    subject: `${SITE_NAME}：密碼已變更`,
    text: `${lines.join("\n\n")}\n`,
    html: shell("密碼已變更", lines),
  };
}

export function accountDeletedEmail(to: string, keptContent: boolean): MailMessage {
  const lines = [
    "你的帳號已刪除，登入資料與 Email 已從資料庫移除。",
    keptContent
      ? "你選擇保留發文與回覆，它們已轉為匿名，不再與任何帳號連結。"
      : "你選擇一併刪除發文與回覆，它們已從站上移除。",
    "備份檔中的資料會隨備份輪替在 30 天內消失。",
  ];
  return {
    to,
    subject: `${SITE_NAME}：帳號已刪除`,
    text: `${lines.join("\n\n")}\n`,
    html: shell("帳號已刪除", lines),
  };
}

export function reportAlertEmail(
  to: string,
  params: {
    count: number;
    targetType: string;
    reason: string;
    adminUrl: string;
    crisis: boolean;
  },
): MailMessage {
  const targetLabel = params.targetType === "POST" ? "貼文" : "回覆";
  const lines = [
    params.crisis
      ? `【可能涉及危機內容】有人舉報了一則${targetLabel}。`
      : `有人舉報了一則${targetLabel}。`,
    `舉報理由：${params.reason}`,
    params.count > 1 ? `目前共有 ${params.count} 件待處理舉報。` : "這是目前唯一一件待處理舉報。",
  ];
  return {
    to,
    subject: params.crisis
      ? `[${SITE_NAME}] ⚠ 危機關鍵字舉報（待處理 ${params.count}）`
      : `[${SITE_NAME}] 新舉報（待處理 ${params.count}）`,
    text: `${lines.join("\n\n")}\n\n${params.adminUrl}\n`,
    html: shell("新舉報", lines, { label: "前往後台處理", url: params.adminUrl }),
  };
}
