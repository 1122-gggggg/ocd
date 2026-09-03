"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit-db";
import { sendMail } from "@/lib/mailer";
import { accountDeletedEmail } from "@/lib/email-templates";
import {
  VERIFICATION_RESEND_LIMIT,
  VERIFICATION_RESEND_WINDOW_MS,
  issueEmailVerification,
} from "@/lib/email-verification";
import {
  DELETE_CONFIRM_PHRASE,
  deleteAccount,
  type DeletionMode,
} from "@/lib/account";

/** Ask for a fresh verification link. */
export async function resendVerificationEmail(): Promise<void> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");
  const userId = session.user.id;

  const gate = await enforceRateLimit(
    `verify:resend:${userId}`,
    VERIFICATION_RESEND_LIMIT,
    VERIFICATION_RESEND_WINDOW_MS,
  );
  if (!gate.allowed) redirect("/settings?err=verify_rate#email");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });
  if (!user?.email) redirect("/settings?err=verify_noemail#email");
  if (user.emailVerified) redirect("/settings?ok=verify_already#email");

  const res = await issueEmailVerification(userId, user.email);
  if (res.skipped) redirect("/settings?err=verify_nomail#email");
  redirect(res.sent ? "/settings?ok=verify_sent#email" : "/settings?err=verify_failed#email");
}

/**
 * Erase the signed-in account.
 *
 * Three gates, because this is irreversible: the exact confirmation phrase, the
 * current password when the account has one, and an explicit choice about what
 * happens to the member's writing. The farewell mail goes out *before* the rows
 * disappear, since the address is about to stop existing.
 */
export async function deleteMyAccount(formData: FormData): Promise<void> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");
  const userId = session.user.id;

  const gate = await enforceRateLimit(`account:delete:${userId}`, 5, 60 * 60 * 1000);
  if (!gate.allowed) redirect("/settings?err=del_rate#danger");

  const confirm = String(formData.get("confirm") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rawMode = String(formData.get("mode") ?? "");
  const mode: DeletionMode = rawMode === "ANONYMIZE" ? "ANONYMIZE" : "PURGE";

  if (confirm !== DELETE_CONFIRM_PHRASE) redirect("/settings?err=del_phrase#danger");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, passwordHash: true, role: true, isSystem: true },
  });
  if (!user) redirect("/login");
  if (user.isSystem) redirect("/settings?err=del_system#danger");

  if (user.passwordHash) {
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      redirect("/settings?err=del_password#danger");
    }
  }

  // Losing the last admin would lock the site's moderation queue with no way
  // back in short of a database edit.
  if (user.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN", isSystem: false } });
    if (admins <= 1) redirect("/settings?err=del_last_admin#danger");
  }

  if (user.email) {
    await sendMail(accountDeletedEmail(user.email, mode === "ANONYMIZE")).catch(
      () => undefined,
    );
  }

  const summary = await deleteAccount(userId, mode);
  logger.info("account: self-service deletion completed", { ...summary });

  revalidatePath("/", "layout");
  await signOut({ redirectTo: "/?deleted=1" });
}
