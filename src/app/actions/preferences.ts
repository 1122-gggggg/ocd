"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { PostSupportMode } from "@prisma/client";

export interface SupportPreferenceItem {
  preferredSupportMode: PostSupportMode;
  hideSensitiveTopics: boolean;
  preferredTopics: string[];
  allowPeerMatching: boolean;
  showRecoveryPrompts: boolean;
}

export const COMMON_TOPICS = [
  { id: "contamination", label: "清潔與污染 (Contamination)" },
  { id: "harm", label: "傷害與失控疑慮 (Harm OCD)" },
  { id: "rocd", label: "伴侶與關係強迫 (ROCD)" },
  { id: "scrupulosity", label: "道德宗教與罪咎 (Scrupulosity)" },
  { id: "false_memory", label: "假記憶與過去核對 (False Memory)" },
  { id: "health", label: "健康與身體感官 (Health OCD)" },
  { id: "sexual", label: "性侵入性念頭 (Sexual Intrusive)" },
  { id: "existential", label: "存在與真實感 (Existential OCD)" },
] as const;

export async function getSupportPreference(
  userId?: string
): Promise<SupportPreferenceItem | null> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  const targetUserId = userId || session?.user?.id;
  if (!targetUserId) return null;

  const pref = await prisma.supportPreference.findUnique({
    where: { userId: targetUserId },
  });

  if (!pref) {
    return {
      preferredSupportMode: "EMPATHY",
      hideSensitiveTopics: false,
      preferredTopics: [],
      allowPeerMatching: true,
      showRecoveryPrompts: true,
    };
  }

  return {
    preferredSupportMode: pref.preferredSupportMode,
    hideSensitiveTopics: pref.hideSensitiveTopics,
    preferredTopics: pref.preferredTopics,
    allowPeerMatching: pref.allowPeerMatching,
    showRecoveryPrompts: pref.showRecoveryPrompts,
  };
}

export async function updateSupportPreference(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入" };
  }

  const preferredSupportModeRaw = String(formData.get("preferredSupportMode") ?? "EMPATHY");
  const validModes: PostSupportMode[] = [
    "EMPATHY",
    "SHARE_EXPERIENCE",
    "FACING_OCD",
    "LOOKING_FOR_EXPERIENCE",
  ];
  const preferredSupportMode =
    validModes.find((m) => m === preferredSupportModeRaw) ?? "EMPATHY";

  const hideSensitiveTopics =
    formData.get("hideSensitiveTopics") === "1" ||
    formData.get("hideSensitiveTopics") === "on";

  const allowPeerMatching =
    formData.get("allowPeerMatching") === "1" ||
    formData.get("allowPeerMatching") === "on";

  const showRecoveryPrompts =
    formData.get("showRecoveryPrompts") === "1" ||
    formData.get("showRecoveryPrompts") === "on";

  const preferredTopicsRaw = formData.getAll("hiddenTopics").map(String);

  await prisma.supportPreference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      preferredSupportMode,
      hideSensitiveTopics,
      preferredTopics: preferredTopicsRaw,
      allowPeerMatching,
      showRecoveryPrompts,
    },
    update: {
      preferredSupportMode,
      hideSensitiveTopics,
      preferredTopics: preferredTopicsRaw,
      allowPeerMatching,
      showRecoveryPrompts,
    },
  });

  revalidatePath("/settings");
  return { ok: true, message: "偏好設定已更新" };
}
