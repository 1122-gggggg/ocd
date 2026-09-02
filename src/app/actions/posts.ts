"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canCreatePost, canReply } from "@/lib/permissions";
import { containsCrisisKeyword } from "@/lib/crisis-keywords";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(
  boardSlug: string,
  formData: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = await auth() as unknown as { user?: { id: string; role: string; clinicianStatus: string } } | null;
  const user = session?.user;
  if (!user?.id) {
    return { ok: false, code: "UNAUTHORIZED", message: "請先登入" };
  }
  const title = String(formData.get("title") ?? "").trim();
  const bodyMd = String(formData.get("bodyMd") ?? "").trim();
  const isAnonymous = formData.get("isAnonymous") === "1" || formData.get("isAnonymous") === "on";
  const confirmCrisis = String(formData.get("confirmCrisis") ?? "");

  if (!title || title.length > 80) {
    return { ok: false, code: "INVALID_TITLE", message: "標題 1-80 字" };
  }
  if (!bodyMd || bodyMd.length > 20000) {
    return { ok: false, code: "INVALID_BODY", message: "正文 1-20000 字" };
  }
  if (containsCrisisKeyword(bodyMd) && confirmCrisis !== "1") {
    return { ok: false, code: "CRISIS_CONFIRM", message: "請確認已閱讀求助資源" };
  }
  const board = await prisma.board.findUnique({ where: { slug: boardSlug } });
  if (!board) return { ok: false, code: "BOARD_NOT_FOUND" };
  const can = canCreatePost(user as any, board as any);
  if (!can) return { ok: false, code: "FORBIDDEN", message: "無權限發文" };

  const post = await prisma.post.create({
    data: {
      boardId: board.id,
      authorId: user.id,
      title,
      bodyMd,
      isAnonymous,
    },
  });
  revalidatePath(`/b/${boardSlug}`);
  revalidatePath(`/b/${boardSlug}/p/${post.id}`);
  redirect(`/b/${boardSlug}/p/${post.id}`);
}

export async function createReply(
  postId: string,
  formData: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = await auth() as unknown as { user?: { id: string; role: string; clinicianStatus: string } } | null;
  const user = session?.user;
  if (!user?.id) {
    return { ok: false, code: "UNAUTHORIZED" };
  }
  const bodyMd = String(formData.get("bodyMd") ?? "").trim();
  const isAnonymous = formData.get("isAnonymous") === "1" || formData.get("isAnonymous") === "on";
  const confirmCrisis = String(formData.get("confirmCrisis") ?? "");
  const replyToFloorRaw = formData.get("replyToFloor");
  const replyToFloor = replyToFloorRaw ? parseInt(String(replyToFloorRaw), 10) : null;

  if (!bodyMd || bodyMd.length > 20000) {
    return { ok: false, code: "INVALID_BODY" };
  }
  if (containsCrisisKeyword(bodyMd) && confirmCrisis !== "1") {
    return { ok: false, code: "CRISIS_CONFIRM" };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { board: true },
  });
  if (!post) return { ok: false, code: "POST_NOT_FOUND" };
  const can = canReply(user as any, post.board as any, post as any);
  if (!can) return { ok: false, code: "FORBIDDEN" };

  // transaction for floor
  const reply = await prisma.$transaction(async (tx) => {
    const max = await tx.reply.findFirst({
      where: { postId },
      orderBy: { floor: "desc" },
      select: { floor: true },
    });
    const nextFloor = (max?.floor ?? 0) + 1;
    return tx.reply.create({
      data: {
        postId,
        authorId: user.id,
        bodyMd,
        isAnonymous,
        floor: nextFloor,
        replyToFloor: replyToFloor && !isNaN(replyToFloor) ? replyToFloor : null,
      },
    });
  });

  revalidatePath(`/b/${post.board.slug}/p/${postId}`);
  return { ok: true };
}
