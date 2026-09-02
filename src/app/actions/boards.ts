"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function normalizeSlug(s: string): string | null {
  const lower = s.toLowerCase().trim();
  if (!/^[a-z0-9-]+$/.test(lower)) return null;
  if (lower.length < 2 || lower.length > 40) return null;
  return lower;
}

export async function createBoardApplication(formData: FormData) {
  const session = await auth() as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) return { ok: false, code: "UNAUTHORIZED" };
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const group = String(formData.get("group") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rationale = String(formData.get("rationale") ?? "").trim();

  if (!name || name.length > 40) return { ok: false, code: "INVALID_NAME" };
  const slug = normalizeSlug(slugRaw);
  if (!slug) return { ok: false, code: "INVALID_SLUG", message: "slug 僅允許小寫英文、數字與 -，2-40 字" };
  if (!["SYMPTOM", "TREATMENT", "COMMUNITY"].includes(group)) return { ok: false, code: "INVALID_GROUP" };
  if (!description || description.length > 500) return { ok: false, code: "INVALID_DESC" };
  if (!rationale || rationale.length > 2000) return { ok: false, code: "INVALID_RATIONALE" };

  const existsBoard = await prisma.board.findUnique({ where: { slug } });
  if (existsBoard) return { ok: false, code: "SLUG_TAKEN", message: "slug 已被版區使用" };
  const existsPending = await prisma.boardApplication.findFirst({ where: { slug, status: "PENDING" } });
  if (existsPending) return { ok: false, code: "SLUG_TAKEN", message: "slug 已有待審申請" };

  await prisma.boardApplication.create({
    data: {
      proposerId: session.user.id,
      name,
      slug,
      group: group as any,
      description,
      rationale,
    },
  });
  revalidatePath("/admin/applications");
  redirect("/boards/apply?ok=1");
}

export async function reviewBoardApplication(formData: FormData) {
  const session = await auth() as unknown as { user?: { id: string; role: string } } | null;
  if (!session?.user || session.user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reviewNote = String(formData.get("reviewNote") ?? "").trim() || null;

  if (!["APPROVED", "REJECTED"].includes(status)) return { ok: false, code: "INVALID_STATUS" };
  const app = await prisma.boardApplication.findUnique({ where: { id } });
  if (!app) return { ok: false, code: "NOT_FOUND" };

  await prisma.boardApplication.update({
    where: { id },
    data: { status: status as any, reviewNote },
  });

  if (status === "APPROVED") {
    // Create board with disclaimer
    const disclaimer = "本站內容由使用者撰寫或管理員整理，僅供經驗交流，不是醫療診斷、處方或治療建議。請勿依據本站內容自行停藥或改變治療。緊急狀況請撥打 1925 或當地緊急醫療。";
    await prisma.board.create({
      data: {
        slug: app.slug,
        name: app.name,
        description: app.description,
        group: app.group,
        officialMd: disclaimer,
        status: "ACTIVE",
      },
    });
  }
  revalidatePath("/admin/applications");
  revalidatePath("/");
  redirect("/admin/applications");
}

export async function updateOfficialMd(formData: FormData) {
  const session = await auth() as unknown as { user?: { role: string } } | null;
  if (!session?.user || session.user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  const slug = String(formData.get("slug") ?? "");
  const officialMd = String(formData.get("officialMd") ?? "");
  if (officialMd.length > 20000) return { ok: false, code: "TOO_LONG" };
  const board = await prisma.board.findUnique({ where: { slug } });
  if (!board) return { ok: false, code: "NOT_FOUND" };
  await prisma.board.update({ where: { slug }, data: { officialMd } });
  revalidatePath(`/b/${slug}`);
  revalidatePath("/admin/boards");
  return { ok: true };
}
