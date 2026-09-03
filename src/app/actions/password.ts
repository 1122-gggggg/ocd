"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/rate-limit";
import { enforceRateLimit } from "@/lib/rate-limit-db";
import { hashToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";
import { sendMail } from "@/lib/mailer";
import { passwordChangedEmail } from "@/lib/email-templates";
import {
  hashPassword,
  issuePasswordReset,
  redeemPasswordReset,
} from "@/lib/password";
import { validatePassword } from "@/lib/password-policy";

const HOUR = 60 * 60 * 1000;

async function clientIp(): Promise<string> {
  try {
    return getClientIp(await headers());
  } catch {
    return "unknown";
  }
}

/**
 * Step 1 of "forgot password": accept an address and, if it belongs to a
 * password account, mail a single-use link.
 *
 * The redirect target is the same regardless of outcome. Telling the visitor
 * "no such account" would turn this form into a membership oracle for a
 * mental-health community, which is a disclosure worth more than the small
 * usability win.
 */
export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ip = await clientIp();

  // Two buckets: one stops an attacker sweeping many addresses from one host,
  // the other stops mailbox-bombing a single victim from many hosts.
  const byIp = await enforceRateLimit(`reset:req:ip:${ip}`, 5, HOUR);
  if (!byIp.allowed) {
    logger.warn("reset: request rate limited by ip", { ip });
    redirect("/forgot-password?err=rate");
  }

  if (!email || !email.includes("@")) {
    redirect("/forgot-password?err=email");
  }

  const byEmail = await enforceRateLimit(`reset:req:email:${hashToken(email)}`, 3, HOUR);
  if (byEmail.allowed) {
    await issuePasswordReset(email);
  } else {
    logger.warn("reset: request rate limited by address");
  }

  redirect("/forgot-password?sent=1");
}

/** Step 2: redeem the link and set a new password. */
export async function submitPasswordReset(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const back = `/reset-password?token=${encodeURIComponent(token)}`;

  const ip = await clientIp();
  const gate = await enforceRateLimit(`reset:submit:ip:${ip}`, 10, HOUR);
  if (!gate.allowed) redirect(`${back}&err=rate`);

  if (password !== confirm) redirect(`${back}&err=mismatch`);

  const result = await redeemPasswordReset(token, password);
  if (!result.ok) {
    redirect(`${back}&err=${result.reason.toLowerCase()}`);
  }
  redirect("/login?reset=1");
}

/**
 * Change the password while signed in. Requires the current one, so a session
 * left open on a shared machine cannot be used to lock the owner out.
 */
export async function changePassword(formData: FormData): Promise<void> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");
  const userId = session.user.id;

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const gate = await enforceRateLimit(`password:change:${userId}`, 5, HOUR);
  if (!gate.allowed) redirect("/settings?err=pw_rate#password");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true, nickname: true },
  });
  if (!user) redirect("/login");

  // Google-only accounts have nothing to compare against; sending them through
  // the emailed reset flow is the only way to *add* a password safely.
  if (!user.passwordHash) redirect("/settings?err=pw_oauth#password");
  if (!(await bcrypt.compare(current, user.passwordHash))) {
    redirect("/settings?err=pw_current#password");
  }
  if (next !== confirm) redirect("/settings?err=pw_mismatch#password");

  const problem = validatePassword(next, {
    email: user.email,
    nickname: user.nickname,
  });
  if (problem) redirect(`/settings?err=pw_weak#password`);

  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(next),
      // Invalidates every other device on its next token refresh.
      sessionsInvalidBefore: now,
    },
  });
  await prisma.session.deleteMany({ where: { userId } });
  logger.info("password: changed by owner", { userId });

  if (user.email) {
    await sendMail(passwordChangedEmail(user.email, now)).catch(() => undefined);
  }

  // This browser's own JWT predates the cut-off too, so end it deliberately
  // rather than letting the next request bounce the user somewhere confusing.
  await signOut({ redirectTo: "/login?pwchanged=1" });
}
