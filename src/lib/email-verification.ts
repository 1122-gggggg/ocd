import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { mailerConfigured, sendMail, redactEmail } from "@/lib/mailer";
import { verifyEmailEmail } from "@/lib/email-templates";
import { absoluteUrl } from "@/lib/site-url";
import {
  EMAIL_VERIFICATION_TTL_MS,
  generateToken,
  hashToken,
} from "@/lib/tokens";

/**
 * Email ownership verification.
 *
 * ## Why enforcement is opt-in
 * `REQUIRE_EMAIL_VERIFICATION=true` blocks unverified accounts from posting and
 * replying. It stays off by default, and is force-disabled whenever no mail
 * transport is configured — otherwise a missing `RESEND_API_KEY` would silently
 * turn the whole forum read-only with no way for a member to fix it. Reading,
 * logging in and deleting your own account are never gated, only publishing.
 *
 * Registration always *issues* a verification mail when a transport exists, so
 * accounts accumulate a proven address long before enforcement is switched on.
 */

const REQUIRE_FLAG =
  (process.env.REQUIRE_EMAIL_VERIFICATION ?? "").toLowerCase() === "true";

/** Enforcement is only real when mail can actually be delivered. */
export const emailVerificationEnforced = REQUIRE_FLAG && mailerConfigured;

/** Operator asked for enforcement but mail is missing — worth shouting about. */
export const emailVerificationMisconfigured = REQUIRE_FLAG && !mailerConfigured;

export const EMAIL_VERIFICATION_TTL_HOURS = Math.round(
  EMAIL_VERIFICATION_TTL_MS / (60 * 60 * 1000),
);

/** How often one account may ask for a fresh link. */
export const VERIFICATION_RESEND_LIMIT = 3;
export const VERIFICATION_RESEND_WINDOW_MS = 60 * 60 * 1000;

export type IssueResult = {
  /** A mail transport accepted the message. */
  sent: boolean;
  /** No transport configured — the caller should say so rather than claim success. */
  skipped: boolean;
};

/**
 * Mint a fresh single-use verification link and mail it.
 *
 * Any earlier unused token for the account is deleted first, so a link that was
 * forwarded or logged somewhere stops working as soon as a new one is asked for.
 */
export async function issueEmailVerification(
  userId: string,
  email: string,
): Promise<IssueResult> {
  if (!mailerConfigured) {
    logger.warn("verify: skipped, no mail transport", { userId });
    return { sent: false, skipped: true };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } }),
    prisma.emailVerificationToken.create({
      data: { userId, email, tokenHash: hashToken(token), expiresAt },
    }),
  ]);

  const url = await absoluteUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  const res = await sendMail(
    verifyEmailEmail(email, url, EMAIL_VERIFICATION_TTL_HOURS),
  );

  logger.info("verify: link issued", {
    userId,
    to: redactEmail(email),
    delivered: res.ok,
  });
  return { sent: res.ok, skipped: false };
}

export type ConsumeOutcome =
  | { ok: true }
  | { ok: false; reason: "INVALID" | "EXPIRED" | "USED" | "EMAIL_CHANGED" };

/**
 * Redeem a verification link. Single-use: the token row is marked spent in the
 * same transaction that stamps `User.emailVerified`.
 */
export async function consumeEmailVerification(
  token: string,
): Promise<ConsumeOutcome> {
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      userId: true,
      email: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { email: true } },
    },
  });

  if (!row) return { ok: false, reason: "INVALID" };
  if (row.usedAt) return { ok: false, reason: "USED" };
  if (row.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "EXPIRED" };
  // The address moved after the link was sent; verifying would mark the *new*
  // address as proven on the strength of mail sent to the old one.
  if (row.user.email !== row.email) return { ok: false, reason: "EMAIL_CHANGED" };

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerified: new Date() },
    }),
  ]);

  logger.info("verify: email confirmed", { userId: row.userId });
  return { ok: true };
}

/**
 * Gate for publishing actions. Returns an error payload when the member must
 * verify first, or null when they may proceed.
 */
export async function requireVerifiedEmail(
  userId: string,
): Promise<{ ok: false; code: string; message: string } | null> {
  if (!emailVerificationEnforced) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, email: true },
  });
  // OAuth-only accounts without a stored address cannot verify; do not trap them.
  if (!user?.email) return null;
  if (user.emailVerified) return null;
  return {
    ok: false,
    code: "EMAIL_NOT_VERIFIED",
    message: "請先到「帳號設定」完成 Email 驗證後再發表內容。",
  };
}

/** Prune spent and expired rows. Called by the nightly cron. */
export async function pruneVerificationTokens(): Promise<number> {
  const res = await prisma.emailVerificationToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      ],
    },
  });
  return res.count;
}
