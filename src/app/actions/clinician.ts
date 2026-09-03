"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { r2, R2_BUCKET, r2Enabled } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createId as cuid } from "@paralleldrive/cuid2";

const PROOF_MAX_BYTES = 5 * 1024 * 1024;
const PROOF_ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const PROOF_EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};
const PROOF_MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

/**
 * Magic-byte check on the file head. MIME type and filename are both
 * attacker-controlled, so the content decides: PDF "%PDF", PNG 89 50 4E 47,
 * JPEG FF D8.
 */
function hasAllowedProofMagic(head: Uint8Array, mime: string): boolean {
  if (mime === "application/pdf") {
    return (
      head.length >= 4 && head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46
    );
  }
  if (mime === "image/png") {
    return (
      head.length >= 4 && head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
    );
  }
  if (mime === "image/jpeg") {
    return head.length >= 2 && head[0] === 0xff && head[1] === 0xd8;
  }
  return false;
}
export async function createClinicianApplication(formData: FormData) {
  const session = (await auth()) as unknown as { user?: { id: string; memberType: string } } | null;
  if (!session?.user?.id) return { ok: false, code: "UNAUTHORIZED" };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) return { ok: false, code: "NOT_FOUND" };
  if (dbUser.memberType !== "CLINICIAN") {
    return { ok: false, code: "FORBIDDEN", message: "註冊時請選臨床者" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const statement = String(formData.get("statement") ?? "").trim();
  if (!title || title.length > 100) return { ok: false, code: "INVALID_TITLE" };
  if (!specialty || specialty.length > 100) return { ok: false, code: "INVALID_SPECIALTY" };
  if (!statement || statement.length > 2000) return { ok: false, code: "INVALID_STATEMENT" };

  let proofPath: string | null = null;
  const file = formData.get("proof") as unknown as File | null;
  if (file && typeof file === "object" && "arrayBuffer" in file && file.size > 0) {
    if (!r2Enabled) return { ok: false, code: "STORAGE_NOT_CONFIGURED" };
    if (!PROOF_ALLOWED_TYPES.includes(file.type)) {
      return { ok: false, code: "INVALID_FILE_TYPE", message: "僅接受 jpeg/png/pdf" };
    }
    if (file.size > PROOF_MAX_BYTES) {
      return { ok: false, code: "FILE_TOO_LARGE", message: "檔案需 ≤5MB" };
    }
    // Extension allowlist from the client filename, consistent with the MIME
    // type. Both are spoofable — the magic-byte check below decides.
    const nameExt = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!nameExt || PROOF_MIME_BY_EXT[nameExt] !== file.type) {
      return { ok: false, code: "INVALID_FILE_TYPE", message: "僅接受 jpeg/png/pdf" };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > PROOF_MAX_BYTES) {
      return { ok: false, code: "FILE_TOO_LARGE", message: "檔案需 ≤5MB" };
    }
    if (!hasAllowedProofMagic(buffer, file.type)) {
      return { ok: false, code: "INVALID_FILE_TYPE", message: "檔案內容與格式不符，僅接受 jpeg/png/pdf" };
    }
    const ext = PROOF_EXT_BY_MIME[file.type] ?? "bin";
    // Server-randomized key: never derive storage paths from user input.
    const key = `proofs/${cuid()}.${ext}`;
    await r2!.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
    proofPath = `r2://${R2_BUCKET}/${key}`;
  }

  const existing = await prisma.clinicianApplication.findUnique({ where: { userId: dbUser.id } });
  if (existing) {
    await prisma.clinicianApplication.update({
      where: { userId: dbUser.id },
      data: {
        title,
        specialty,
        statement,
        proofPath: proofPath ?? existing.proofPath,
        status: "PENDING",
        reviewNote: null,
      },
    });
  } else {
    await prisma.clinicianApplication.create({
      data: {
        userId: dbUser.id,
        title,
        specialty,
        statement,
        proofPath,
      },
    });
  }
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { clinicianStatus: "PENDING" },
  });
  revalidatePath("/clinician/apply");
  revalidatePath("/admin/clinicians");
  redirect("/clinician/apply?ok=1");
}

export async function reviewClinicianApplication(formData: FormData) {
  const session = (await auth()) as unknown as { user?: { role: string } } | null;
  if (!session?.user || session.user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reviewNote = String(formData.get("reviewNote") ?? "").trim() || null;
  if (!["APPROVED", "REJECTED"].includes(status)) return { ok: false, code: "INVALID_STATUS" };
  const app = await prisma.clinicianApplication.findUnique({ where: { id } });
  if (!app) return { ok: false, code: "NOT_FOUND" };
  await prisma.clinicianApplication.update({
    where: { id },
    data: { status: status as "APPROVED" | "REJECTED", reviewNote },
  });
  await prisma.user.update({
    where: { id: app.userId },
    data: { clinicianStatus: status === "APPROVED" ? "VERIFIED" : "REJECTED" },
  });
  revalidatePath("/admin/clinicians");
  redirect("/admin/clinicians");
}
