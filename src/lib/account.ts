import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { r2, R2_BUCKET } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Account export and erasure.
 *
 * Taiwan's 個資法 (and the GDPR the site may also face) gives a member the right
 * to take their data with them and to have it deleted. Both have to be
 * self-service: "email the admin" is not a usable channel at 3am, which is
 * exactly when someone panicking about what they posted needs it.
 *
 * Deletion offers two shapes, because a support forum is not a blog:
 *
 * - `PURGE` — posts and replies go too. The cleanest answer to "erase me", and
 *   the one a member in distress usually means.
 * - `ANONYMIZE` — the account is destroyed but the writing is reassigned to a
 *   single tombstone account, so the threads other people replied under stay
 *   readable. Nothing links back to the person: email, password hash, nickname
 *   and every application row are gone, and each item is flipped to anonymous.
 *
 * Either way the User row itself is deleted, so a later "do you still hold my
 * data?" has an honest answer.
 */

export type DeletionMode = "PURGE" | "ANONYMIZE";

/**
 * Typed verbatim by the member to confirm erasure. It lives here rather than in
 * the action module because a "use server" file may only export async
 * functions — and the settings form needs the same string to label the input.
 */
export const DELETE_CONFIRM_PHRASE = "刪除我的帳號";

/** Stable id so the tombstone survives reseeding and is easy to recognise. */
export const TOMBSTONE_USER_ID = "system-deleted-user";
export const TOMBSTONE_NICKNAME = "已刪除的使用者";

/**
 * The account that inherits content under `ANONYMIZE`. Created on demand with
 * no email and no password hash, so it can never be logged into, and flagged
 * `isSystem` so listings can exclude it.
 */
export async function getTombstoneUser(): Promise<{ id: string }> {
  return prisma.user.upsert({
    where: { id: TOMBSTONE_USER_ID },
    update: {},
    create: {
      id: TOMBSTONE_USER_ID,
      nickname: TOMBSTONE_NICKNAME,
      email: null,
      passwordHash: null,
      profileComplete: true,
      isSystem: true,
      memberType: "PATIENT",
      role: "USER",
    },
    select: { id: true },
  });
}

/** Everything the site holds about one member, as plain JSON. */
export async function buildUserExport(userId: string) {
  const [user, posts, replies, reports, boardApplications, clinicianApplication] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          nickname: true,
          memberType: true,
          clinicianStatus: true,
          role: true,
          profileComplete: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          bodyMd: true,
          isAnonymous: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          board: { select: { slug: true, name: true } },
        },
      }),
      prisma.reply.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          postId: true,
          floor: true,
          replyToFloor: true,
          bodyMd: true,
          isAnonymous: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.report.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          targetType: true,
          targetId: true,
          reason: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.boardApplication.findMany({
        where: { proposerId: userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          group: true,
          description: true,
          rationale: true,
          status: true,
          reviewNote: true,
          createdAt: true,
        },
      }),
      prisma.clinicianApplication.findUnique({
        where: { userId },
        select: {
          id: true,
          title: true,
          specialty: true,
          statement: true,
          status: true,
          reviewNote: true,
          createdAt: true,
          // proofPath is deliberately omitted: it is an internal storage key,
          // and the uploaded file itself is not part of the JSON export.
        },
      }),
    ]);

  if (!user) return null;

  return {
    exportedAt: new Date().toISOString(),
    format: "ocd-forum-export/1",
    note: "此檔案包含本站持有的你的全部個人資料。臨床證明上傳檔本身不含在內，如需索取請聯絡站務。",
    user,
    posts,
    replies,
    reports,
    boardApplications,
    clinicianApplication,
    counts: {
      posts: posts.length,
      replies: replies.length,
      reports: reports.length,
      boardApplications: boardApplications.length,
    },
  };
}

export type DeletionSummary = {
  mode: DeletionMode;
  posts: number;
  replies: number;
  proofDeleted: boolean;
};

/**
 * Erase an account. Content handling follows `mode`; the User row goes either
 * way, which cascades tokens, sessions, OAuth accounts, reports and
 * applications.
 */
export async function deleteAccount(
  userId: string,
  mode: DeletionMode,
): Promise<DeletionSummary> {
  // The stored proof lives in object storage, outside the transaction. Read the
  // key first, delete the blob after the rows are gone — a leftover row with a
  // missing blob is recoverable, an orphaned blob is not.
  const clinician = await prisma.clinicianApplication.findUnique({
    where: { userId },
    select: { proofPath: true },
  });

  const summary: DeletionSummary = await prisma.$transaction(async (tx) => {
    const [posts, replies] = await Promise.all([
      tx.post.count({ where: { authorId: userId } }),
      tx.reply.count({ where: { authorId: userId } }),
    ]);

    if (mode === "ANONYMIZE" && posts + replies > 0) {
      const tombstone = await tx.user.upsert({
        where: { id: TOMBSTONE_USER_ID },
        update: {},
        create: {
          id: TOMBSTONE_USER_ID,
          nickname: TOMBSTONE_NICKNAME,
          profileComplete: true,
          isSystem: true,
        },
        select: { id: true },
      });
      // isAnonymous is forced on: the tombstone name would otherwise become a
      // single shared identity that groups one person's posts together again.
      await tx.post.updateMany({
        where: { authorId: userId },
        data: { authorId: tombstone.id, isAnonymous: true },
      });
      await tx.reply.updateMany({
        where: { authorId: userId },
        data: { authorId: tombstone.id, isAnonymous: true },
      });
    }

    // Cascades: Account, Session, PasswordResetToken, EmailVerificationToken,
    // Report, BoardApplication, ClinicianApplication — and, under PURGE, the
    // Post and Reply rows still pointing at this author.
    await tx.user.delete({ where: { id: userId } });

    return { mode, posts, replies, proofDeleted: false };
  });

  if (clinician?.proofPath?.startsWith("r2://") && r2) {
    const key = clinician.proofPath.replace(`r2://${R2_BUCKET}/`, "");
    try {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
      summary.proofDeleted = true;
    } catch (err) {
      // Surfaced loudly: this is the one artefact that outlives the row, so a
      // failure here needs a human to finish the erasure by hand.
      logger.error("account: failed to delete clinician proof from R2", {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("account: deleted", {
    userId,
    mode,
    posts: summary.posts,
    replies: summary.replies,
    proofDeleted: summary.proofDeleted,
  });

  return summary;
}
