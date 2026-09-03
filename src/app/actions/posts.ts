"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canCreatePost, canReply } from "@/lib/permissions";
import { containsCrisisKeyword } from "@/lib/crisis-keywords";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(
  boardSlug: string,
  formData: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; clinicianStatus: string };
  } | null;
  const user = session?.user;
  if (!user?.id) {
    return { ok: false, code: "UNAUTHORIZED", message: "請先登入" };
  }
  if (!checkRateLimit(`createPost:${user.id}`, 5, 60_000)) {
    return { ok: false, code: "RATE_LIMITED", message: "發文過於頻繁，請稍後再試" };
  }
  const title = String(formData.get("title") ?? "").trim();
  const bodyMd = String(formData.get("bodyMd") ?? "").trim();
  const isAnonymous =
    formData.get("isAnonymous") === "1" || formData.get("isAnonymous") === "on";
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
  const board = await prisma.board.findUnique({ where: { slug: boardSlug }, select: { id: true, status: true, slug: true } });
  if (!board) return { ok: false, code: "BOARD_NOT_FOUND" };
  const can = canCreatePost(
    user as unknown as Parameters<typeof canCreatePost>[0],
    board as unknown as Parameters<typeof canCreatePost>[1]
  );
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
  revalidateTag("boards-home");
  redirect(`/b/${boardSlug}/p/${post.id}`);
}

function isPrismaP2002(e: unknown): boolean {
  return (
    e !== null &&
    typeof e === "object" &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string" &&
    (e as { code: string }).code === "P2002"
  );
}

export async function createReply(
  postId: string,
  formData: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; clinicianStatus: string };
  } | null;
  const user = session?.user;
  if (!user?.id) {
    return { ok: false, code: "UNAUTHORIZED" };
  }
  if (!checkRateLimit(`createReply:${user.id}`, 10, 60_000)) {
    return { ok: false, code: "RATE_LIMITED", message: "回覆過於頻繁，請稍後再試" };
  }
  const bodyMd = String(formData.get("bodyMd") ?? "").trim();
  const isAnonymous =
    formData.get("isAnonymous") === "1" || formData.get("isAnonymous") === "on";
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
    select: {
      id: true,
      boardId: true,
      deletedAt: true,
      board: { select: { slug: true, status: true } },
    },
  });
  if (!post) return { ok: false, code: "POST_NOT_FOUND" };
  const can = canReply(
    user as unknown as Parameters<typeof canReply>[0],
    post.board as unknown as Parameters<typeof canReply>[1],
    post as unknown as Parameters<typeof canReply>[2]
  );
  if (!can) return { ok: false, code: "FORBIDDEN" };

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const max = await tx.reply.findFirst({
            where: { postId },
            orderBy: { floor: "desc" },
            select: { floor: true },
          });
          const nextFloor = (max?.floor ?? 0) + 1;
          await tx.reply.create({
            data: {
              postId,
              authorId: user.id,
              bodyMd,
              isAnonymous,
              floor: nextFloor,
              replyToFloor: replyToFloor !== null && !isNaN(replyToFloor) ? replyToFloor : null,
            },
          });
        },
        { isolationLevel: "Serializable" }
      );
      revalidatePath(`/b/${post.board.slug}/p/${postId}`);
      revalidateTag("boards-home");
      return { ok: true };
    } catch (e: unknown) {
      if (isPrismaP2002(e) && attempt < 2) {
        lastError = e;
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; clinicianStatus: string };
  } | null;
  const user = session?.user;
  if (!user?.id) return { ok: false, code: "UNAUTHORIZED", message: "請先登入" };
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, boardId: true, deletedAt: true, board: { select: { slug: true } } },
  });
  if (!post) return { ok: false, code: "NOT_FOUND" };
  if (post.authorId !== user.id && user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  if (post.deletedAt) return { ok: false, code: "DELETED" };
  const title = String(formData.get("title") ?? "").trim();
  const bodyMd = String(formData.get("bodyMd") ?? "").trim();
  if (!title || title.length > 80) return { ok: false, code: "INVALID_TITLE", message: "標題 1-80 字" };
  if (!bodyMd || bodyMd.length > 20000) return { ok: false, code: "INVALID_BODY", message: "正文 1-20000 字" };
  await prisma.post.update({ where: { id: postId }, data: { title, bodyMd } });
  revalidatePath(`/b/${post.board.slug}/p/${postId}`);
  revalidatePath(`/b/${post.board.slug}`);
  revalidateTag("boards-home");
  return { ok: true };
}

export async function deletePost(
  postId: string,
  _formData?: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string };
  } | null;
  const user = session?.user;
  if (!user?.id) return { ok: false, code: "UNAUTHORIZED" };
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, deletedAt: true, board: { select: { slug: true } } },
  });
  if (!post) return { ok: false, code: "NOT_FOUND" };
  if (post.authorId !== user.id && user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  if (post.deletedAt) return { ok: false, code: "ALREADY_DELETED" };
  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date(), deletedById: user.id },
  });
  revalidatePath(`/b/${post.board.slug}/p/${postId}`);
  revalidatePath(`/b/${post.board.slug}`);
  revalidateTag("boards-home");
  return { ok: true };
}

export async function updateReply(
  replyId: string,
  formData: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string };
  } | null;
  const user = session?.user;
  if (!user?.id) return { ok: false, code: "UNAUTHORIZED" };
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: {
      id: true,
      authorId: true,
      deletedAt: true,
      postId: true,
      post: { select: { board: { select: { slug: true } } } },
    },
  });
  if (!reply) return { ok: false, code: "NOT_FOUND" };
  if (reply.authorId !== user.id && user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  if (reply.deletedAt) return { ok: false, code: "DELETED" };
  const bodyMd = String(formData.get("bodyMd") ?? "").trim();
  if (!bodyMd || bodyMd.length > 20000) return { ok: false, code: "INVALID_BODY", message: "正文 1-20000 字" };
  await prisma.reply.update({ where: { id: replyId }, data: { bodyMd } });
  revalidatePath(`/b/${reply.post.board.slug}/p/${reply.postId}`);
  revalidateTag("boards-home");
  return { ok: true };
}

export async function deleteReply(
  replyId: string,
  _formData?: FormData
): Promise<{ ok: boolean; code?: string; message?: string }> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string };
  } | null;
  const user = session?.user;
  if (!user?.id) return { ok: false, code: "UNAUTHORIZED" };
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: {
      id: true,
      authorId: true,
      deletedAt: true,
      postId: true,
      post: { select: { board: { select: { slug: true } } } },
    },
  });
  if (!reply) return { ok: false, code: "NOT_FOUND" };
  if (reply.authorId !== user.id && user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  if (reply.deletedAt) return { ok: false, code: "ALREADY_DELETED" };
  await prisma.reply.update({
    where: { id: replyId },
    data: { deletedAt: new Date(), deletedById: user.id },
  });
  revalidatePath(`/b/${reply.post.board.slug}/p/${reply.postId}`);
  revalidateTag("boards-home");
  return { ok: true };
}
