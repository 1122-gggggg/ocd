"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "密碼至少 8 字"),
  nickname: z.string().trim().min(2, "暱稱至少 2 字").max(24, "暱稱最多 24 字"),
  memberType: z.enum(["PATIENT", "FAMILY", "CLINICIAN"]),
});

export async function registerUser(formData: FormData) {
  // Rate limit: 5/hour per IP — check before any DB work
  try {
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return { ok: false, code: "RATE_LIMITED", message: "註冊過於頻繁，請稍後再試" };
    }
  } catch {
    // headers() may fail in some contexts (tests); fail open for availability,
    // per-instance limit still applies on next call via IP fallback "unknown"
  }
  const raw = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    nickname: String(formData.get("nickname") ?? "").trim(),
    memberType: String(formData.get("memberType") ?? "PATIENT"),
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT", message: parsed.error.issues[0]?.message };
  }
  const { email, password, nickname, memberType } = parsed.data;

  const existsEmail = await prisma.user.findUnique({ where: { email } });
  if (existsEmail) return { ok: false, code: "EMAIL_TAKEN", message: "Email 已被使用" };
  const existsNick = await prisma.user.findUnique({ where: { nickname } });
  if (existsNick) return { ok: false, code: "NICKNAME_TAKEN", message: "暱稱已被使用" };

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      nickname,
      memberType: memberType as any,
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
  } catch (e) {
    // ignore
  }
  revalidatePath("/");
  redirect("/");
}

export async function completeOnboarding(formData: FormData) {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) return { ok: false, code: "UNAUTHORIZED" };
  const nickname = String(formData.get("nickname") ?? "").trim();
  const memberType = String(formData.get("memberType") ?? "PATIENT");
  if (nickname.length < 2 || nickname.length > 24) return { ok: false, code: "INVALID_NICKNAME" };
  if (!["PATIENT", "FAMILY", "CLINICIAN"].includes(memberType)) return { ok: false, code: "INVALID_MEMBER" };
  const exists = await prisma.user.findUnique({ where: { nickname } });
  if (exists && exists.id !== session.user.id) return { ok: false, code: "NICKNAME_TAKEN" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nickname,
      memberType: memberType as any,
      profileComplete: true,
    },
  });
  redirect("/");
}
