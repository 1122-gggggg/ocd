import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { mailerConfigured, sendMail, redactEmail } from "@/lib/mailer";
import { passwordChangedEmail, passwordResetEmail } from "@/lib/email-templates";
import { absoluteUrl } from "@/lib/site-url";
import { PASSWORD_RESET_TTL_MS, generateToken, hashToken } from "@/lib/tokens";
import { validatePassword } from "@/lib/password-policy";

/**
 * Password reset.
 *
 * The threat model for a support forum is mostly *enumeration*: the fact that a
 * given address has an account here is itself sensitive. So the request
 * endpoint answers identically whether or not the address exists, whether the
 * account is OAuth-only, and whether mail actually went out. The only signal a
 * caller can extract is "we accepted your request".
 */

export const PASSWORD_RESET_TTL_MINUTES = Math.round(
  PASSWORD_RESET_TTL_MS / 60_000,
);

/** bcrypt cost, matching registration. */
const BCRYPT_ROUNDS = 12;

// Re-exported so callers have one import for "everything about passwords",
// while the rules themselves stay in a module with no database dependency.
export { PASSWORD_MIN, validatePassword } from "@/lib/password-policy";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Issue a reset link if — and only if — the address maps to an account that can
 * actually use one. Returns nothing the caller may leak; look at the logs for
 * what happened.
 */
export async function issuePasswordReset(email: string): Promise<void> {
  if (!mailerConfigured) {
    logger.warn("reset: requested but no mail transport configured");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true, isSystem: true },
  });

  // Unknown address, the tombstone account, or a Google-only login with no
  // password to reset: all end here, silently, in the same amount of time as a
  // success from the caller's point of view.
  if (!user || user.isSystem || !user.email) {
    logger.info("reset: no eligible account for request", {
      to: redactEmail(email),
    });
    return;
  }
  if (!user.passwordHash) {
    logger.info("reset: account has no password (OAuth only)", { userId: user.id });
    return;
  }

  const token = generateToken();
  await prisma.$transaction([
    // Only the newest link stays live — asking again kills the previous one.
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    }),
  ]);

  const url = await absoluteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  const res = await sendMail(
    passwordResetEmail(user.email, url, PASSWORD_RESET_TTL_MINUTES),
  );
  logger.info("reset: link issued", { userId: user.id, delivered: res.ok });
}

export type ResetOutcome =
  | { ok: true }
  | { ok: false; reason: "INVALID" | "EXPIRED" | "USED" | "WEAK"; message: string };

/** Look up a reset token without spending it — used to render the form. */
export async function peekResetToken(token: string): Promise<boolean> {
  if (!token) return false;
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { expiresAt: true, usedAt: true },
  });
  return !!row && !row.usedAt && row.expiresAt.getTime() > Date.now();
}

/**
 * Redeem a reset link and set the new password.
 *
 * `sessionsInvalidBefore` is bumped in the same transaction: sessions are JWTs,
 * so deleting Session rows would not log a thief out. Anything minted before
 * this instant is refused on its next refresh, which is at most 60 seconds away.
 */
export async function redeemPasswordReset(
  token: string,
  newPassword: string,
): Promise<ResetOutcome> {
  if (!token) return { ok: false, reason: "INVALID", message: "連結無效" };

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { email: true, nickname: true } },
    },
  });

  if (!row) return { ok: false, reason: "INVALID", message: "連結無效或已被取代" };
  if (row.usedAt) return { ok: false, reason: "USED", message: "這個連結已經使用過了" };
  if (row.expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: "EXPIRED", message: "連結已過期，請重新申請" };
  }

  const problem = validatePassword(newPassword, {
    email: row.user.email,
    nickname: row.user.nickname,
  });
  if (problem) return { ok: false, reason: "WEAK", message: problem };

  const passwordHash = await hashPassword(newPassword);
  const now = new Date();

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: now },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: row.userId, usedAt: null },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash, sessionsInvalidBefore: now },
    }),
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);

  logger.info("reset: password changed via link", { userId: row.userId });

  if (row.user.email) {
    // Best effort. The password is already changed; a bounced notice must not
    // turn a successful reset into an error.
    await sendMail(passwordChangedEmail(row.user.email, now)).catch(() => undefined);
  }

  return { ok: true };
}

/** Prune spent and expired rows. Called by the nightly cron. */
export async function prunePasswordResetTokens(): Promise<number> {
  const res = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      ],
    },
  });
  return res.count;
}
