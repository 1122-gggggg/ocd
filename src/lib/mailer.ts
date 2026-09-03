import { logger } from "@/lib/logger";

/**
 * Outbound email with no new npm dependencies.
 *
 * Everything here is plain `fetch` against an HTTPS API, which is what works on
 * Vercel serverless — long-lived SMTP sockets do not. Two transports, picked in
 * this order:
 *
 * 1. **Resend** — set `RESEND_API_KEY` and `MAIL_FROM`.
 * 2. **Generic webhook** — set `MAIL_WEBHOOK_URL` (plus optional
 *    `MAIL_WEBHOOK_TOKEN`, sent as `Authorization: Bearer …`). The body is
 *    `{ to, subject, text, html, from }`; wire it to Postmark, SES, a Cloudflare
 *    Worker, or anything else you already run.
 *
 * When neither is configured `mailerConfigured` is false. Nothing throws: the
 * message is logged (body included only outside production) and the caller is
 * told delivery did not happen. Features that *depend* on mail — enforced email
 * verification — check `mailerConfigured` and stay off rather than locking
 * everyone out of a site whose mail was never wired up.
 */

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type MailResult =
  | { ok: true; transport: "resend" | "webhook" }
  | { ok: false; transport: "none" | "resend" | "webhook"; error: string };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_WEBHOOK_URL = process.env.MAIL_WEBHOOK_URL;
const MAIL_WEBHOOK_TOKEN = process.env.MAIL_WEBHOOK_TOKEN;

/** `MAIL_FROM` should look like `強迫症互助坊 <no-reply@example.org>`. */
export const MAIL_FROM =
  process.env.MAIL_FROM || "強迫症互助坊 <onboarding@resend.dev>";

export const mailTransport: "resend" | "webhook" | "none" = RESEND_API_KEY
  ? "resend"
  : MAIL_WEBHOOK_URL
    ? "webhook"
    : "none";

/** True when a real transport is available. Gate mail-dependent policy on this. */
export const mailerConfigured = mailTransport !== "none";

/** Network budget for a single send. Serverless functions must not hang. */
const SEND_TIMEOUT_MS = 8_000;

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>,
): Promise<{ ok: boolean; status: number; detail: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const detail = res.ok ? "" : (await res.text().catch(() => "")).slice(0, 500);
    return { ok: res.ok, status: res.status, detail };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Send one message. Never throws — callers decide what a failure means, and for
 * password reset the answer is "say nothing different to the user".
 */
export async function sendMail(msg: MailMessage): Promise<MailResult> {
  if (!mailerConfigured) {
    // Without a transport the link would otherwise be unrecoverable in local
    // development, so print it — but never in production, where mail bodies in
    // the log drain would be a real leak.
    logger.warn("mail: no transport configured, message not sent", {
      to: redactEmail(msg.to),
      subject: msg.subject,
      ...(process.env.NODE_ENV === "production" ? {} : { body: msg.text }),
    });
    return { ok: false, transport: "none", error: "MAIL_NOT_CONFIGURED" };
  }

  try {
    if (mailTransport === "resend") {
      const { ok, status, detail } = await postJson(
        "https://api.resend.com/emails",
        {
          from: MAIL_FROM,
          to: [msg.to],
          subject: msg.subject,
          text: msg.text,
          ...(msg.html ? { html: msg.html } : {}),
          ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
        },
        { authorization: `Bearer ${RESEND_API_KEY}` },
      );
      if (!ok) {
        logger.error("mail: resend rejected message", {
          to: redactEmail(msg.to),
          status,
          detail,
        });
        return { ok: false, transport: "resend", error: `HTTP ${status}` };
      }
      logger.info("mail: sent", { to: redactEmail(msg.to), transport: "resend" });
      return { ok: true, transport: "resend" };
    }

    const { ok, status, detail } = await postJson(
      MAIL_WEBHOOK_URL!,
      {
        from: MAIL_FROM,
        to: msg.to,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        replyTo: msg.replyTo,
      },
      MAIL_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${MAIL_WEBHOOK_TOKEN}` }
        : {},
    );
    if (!ok) {
      logger.error("mail: webhook rejected message", {
        to: redactEmail(msg.to),
        status,
        detail,
      });
      return { ok: false, transport: "webhook", error: `HTTP ${status}` };
    }
    logger.info("mail: sent", { to: redactEmail(msg.to), transport: "webhook" });
    return { ok: true, transport: "webhook" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("mail: send failed", { to: redactEmail(msg.to), error });
    return { ok: false, transport: mailTransport, error };
  }
}

/** `alice@example.org` -> `a***@example.org`. Logs must not carry addresses. */
export function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  return `${email[0]}***${email.slice(at)}`;
}
