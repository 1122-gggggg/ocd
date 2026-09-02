"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function createReport(formData: FormData) {
  const session = await auth() as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) return { ok: false, code: "UNAUTHORIZED" };
  if (!checkRateLimit(`createReport:${session.user.id}`, 5, 60_000)) {
    return { ok: false, code: "RATE_LIMITED", message: "舉報過於頻繁，請稍後再試" };
  }
  const targetType = String(formData.get("targetType") ?? "") as "POST" | "REPLY";
  const targetId = String(formData.get("targetId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!["POST", "REPLY"].includes(targetType)) return { ok: false, code: "INVALID_TARGET" };
  if (!targetId) return { ok: false, code: "INVALID_ID" };
  if (reason.length < 10 || reason.length > 500) return { ok: false, code: "INVALID_REASON", message: "理由 10-500 字" };

  // Check cannot report self and existence
  let authorId: string | null = null;
  if (targetType === "POST") {
    const post = await prisma.post.findUnique({ where: { id: targetId } });
    if (!post) return { ok: false, code: "NOT_FOUND" };
    authorId = post.authorId;
  } else {
    const reply = await prisma.reply.findUnique({ where: { id: targetId } });
    if (!reply) return { ok: false, code: "NOT_FOUND" };
    authorId = reply.authorId;
  }
  if (authorId === session.user.id) return { ok: false, code: "CANNOT_REPORT_SELF", message: "不可舉報自己" };

  const exists = await prisma.report.findUnique({
    where: {
      reporterId_targetType_targetId: {
        reporterId: session.user.id,
        targetType: targetType as any,
        targetId,
      },
    },
  });
  if (exists) return { ok: false, code: "ALREADY_REPORTED", message: "已舉報過" };

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetType: targetType as any,
      targetId,
      reason,
    },
  });
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function moderateContent(formData: FormData) {
  const session = await auth() as unknown as { user?: { id: string; role: string } } | null;
  if (!session?.user || session.user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  const targetType = String(formData.get("targetType") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!["DELETE", "RESTORE"].includes(action)) return { ok: false, code: "INVALID_ACTION" };

  if (targetType === "POST") {
    if (action === "DELETE") {
      await prisma.post.update({
        where: { id: targetId },
        data: { deletedAt: new Date(), deletedById: session.user.id },
      });
    } else {
      await prisma.post.update({
        where: { id: targetId },
        data: { deletedAt: null, deletedById: null },
      });
    }
  } else if (targetType === "REPLY") {
    if (action === "DELETE") {
      await prisma.reply.update({
        where: { id: targetId },
        data: { deletedAt: new Date(), deletedById: session.user.id },
      });
    } else {
      await prisma.reply.update({
        where: { id: targetId },
        data: { deletedAt: null, deletedById: null },
      });
    }
  } else {
    return { ok: false, code: "INVALID_TARGET" };
  }
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function resolveReport(formData: FormData) {
  const session = await auth() as unknown as { user?: { role: string } } | null;
  if (!session?.user || session.user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["RESOLVED", "DISMISSED"].includes(status)) return { ok: false, code: "INVALID_STATUS" };
  await prisma.report.update({
    where: { id },
    data: { status: status as any, resolvedAt: new Date() },
  });
  revalidatePath("/admin/reports");
  return { ok: true };
}
