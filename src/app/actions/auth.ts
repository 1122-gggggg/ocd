"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { NICKNAME_MAX, normalizeNickname } from "@/lib/nickname";

// A "use server" module may only export async functions, so the nickname rules
// live in @/lib/nickname and are re-used by both the actions and the UI.
const nicknameSchema = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => v.length > 0, "請輸入暱稱")
  .refine((v) => v.length <= NICKNAME_MAX, `暱稱最多 ${NICKNAME_MAX} 字`);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "密碼至少 8 字"),
  nickname: nicknameSchema,
  memberType: z.enum(["PATIENT", "FAMILY", "CLINICIAN"]),
});

export async function registerUser(formData: FormData) {
  // Rate limit: 5/hour per IP — check before any DB work
  try {
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      redirect("/register?err=rate");
    }
  } catch {
    // headers() may fail in some contexts (tests); fail open for availability,
    // per-instance limit still applies on next call via IP fallback "unknown"
  }
  const raw = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    nickname: normalizeNickname(formData.get("nickname")),
    memberType: String(formData.get("memberType") ?? "PATIENT"),
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/register?err=invalid");
  }
  const { email, password, nickname, memberType } = parsed.data;

  const existsEmail = await prisma.user.findUnique({ where: { email } });
  if (existsEmail) redirect("/register?err=taken");

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      nickname,
      memberType: memberType as never,
      profileComplete: true,
    },
  });

  // Auto login
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    // Sign-in failure here is non-fatal: the account exists, the user can log in manually.
  }
  revalidatePath("/");
  redirect("/");
}
// Login throttle: 5 attempts / 15 min per IP + email bucket. Mirrors the
// inline check in "@/app/login/page" — keep the key scheme and limits in sync.
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const INVALID_CREDENTIALS_MESSAGE = "帳號或密碼錯誤，請再試一次。";

/**
 * Credentials login with fail-closed per-IP + per-email throttling.
 * Unknown email, wrong password, and missing fields all return the same
 * INVALID_CREDENTIALS message so callers cannot enumerate accounts.
 */
export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  // Throttle BEFORE any credential check; deny when the limiter errors.
  try {
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    if (!checkRateLimit(`login:${ip}:${email || "unknown"}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
      return { ok: false, code: "RATE_LIMITED", message: "登入嘗試過於頻繁，請稍後再試" };
    }
  } catch {
    return { ok: false, code: "RATE_LIMITED", message: "登入嘗試過於頻繁，請稍後再試" };
  }
  if (!email || !password) {
    return { ok: false, code: "INVALID_CREDENTIALS", message: INVALID_CREDENTIALS_MESSAGE };
  }
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true, code: "OK" };
  } catch (e: unknown) {
    const err = e as { type?: string };
    // Unknown email and wrong password both surface as CredentialsSignin —
    // keep the uniform message so accounts cannot be enumerated.
    if (err?.type === "CredentialsSignin") {
      return { ok: false, code: "INVALID_CREDENTIALS", message: INVALID_CREDENTIALS_MESSAGE };
    }
    throw e;
  }
}

export async function completeOnboarding(formData: FormData) {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) return { ok: false, code: "UNAUTHORIZED" };
  const nickname = normalizeNickname(formData.get("nickname"));
  const memberType = String(formData.get("memberType") ?? "PATIENT");
  if (!nickname) return { ok: false, code: "INVALID_NICKNAME", message: "請輸入暱稱" };
  if (nickname.length > NICKNAME_MAX) {
    return { ok: false, code: "INVALID_NICKNAME", message: `暱稱最多 ${NICKNAME_MAX} 字` };
  }
  if (!["PATIENT", "FAMILY", "CLINICIAN"].includes(memberType)) {
    return { ok: false, code: "INVALID_MEMBER", message: "請選擇身分" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nickname,
      memberType: memberType as never,
      profileComplete: true,
    },
  });
  revalidatePath("/", "layout");
  redirect("/");
}

/** Change the display name at any time. No uniqueness, no character rules. */
export async function updateNickname(formData: FormData) {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");

  const nickname = normalizeNickname(formData.get("nickname"));
  if (!nickname) redirect("/settings?err=empty");
  if (nickname.length > NICKNAME_MAX) redirect("/settings?err=long");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nickname },
  });

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  redirect("/settings?ok=nickname");
}
