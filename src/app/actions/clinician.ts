"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { r2, R2_BUCKET, r2Enabled } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      return { ok: false, code: "INVALID_FILE_TYPE", message: "僅接受 jpeg/png/pdf" };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, code: "FILE_TOO_LARGE", message: "檔案需 ≤5MB" };
    }
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
    };
    const ext = extMap[file.type] ?? "bin";
    const key = `${dbUser.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    if (r2Enabled && r2) {
      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );
      proofPath = `r2://${R2_BUCKET}/${key}`;
    } else {
      const dir = path.resolve("uploads/clinician-proof");
      await mkdir(dir, { recursive: true });
      const fullPath = path.join(dir, key);
      await writeFile(fullPath, buffer);
      proofPath = fullPath;
    }
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
    data: { status: status as any, reviewNote },
  });
  await prisma.user.update({
    where: { id: app.userId },
    data: { clinicianStatus: status === "APPROVED" ? "VERIFIED" : "REJECTED" },
  });
  revalidatePath("/admin/clinicians");
  redirect("/admin/clinicians");
}
