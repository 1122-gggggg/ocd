import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { r2, R2_BUCKET } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "@/lib/logger";

// Fixed allowlist: the served Content-Type derives from the stored key's
// extension only — never reflect the uploader-influenced object ContentType.
const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
};
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = (await auth()) as unknown as {
    user?: { id?: string; role: string };
  } | null;
  const { userId } = await params;
  if (!session?.user || session.user.role !== "ADMIN") {
    logger.warn("admin/proof: non-admin access denied", { targetUserId: userId });
    return new NextResponse("Not Found", { status: 404 });
  }
  const adminId = session.user.id ?? "unknown";
  const app = await prisma.clinicianApplication.findUnique({ where: { userId } });
  if (!app?.proofPath) {
    logger.info("admin/proof: proof not found", { adminId, targetUserId: userId });
    return new NextResponse("Not Found", { status: 404 });
  }
  const prefix = `r2://${R2_BUCKET}/`;
  if (!app.proofPath.startsWith(prefix)) {
    logger.info("admin/proof: legacy proof path", { adminId, targetUserId: userId });
    return new NextResponse("Not Found", { status: 404 });
  }
  if (!r2) return new NextResponse("Not Found", { status: 404 });
  const key = app.proofPath.slice(prefix.length);
  if (!key || key.includes("..") || key.includes("\\")) {
    logger.warn("admin/proof: suspicious proof key", { adminId, targetUserId: userId });
    return new NextResponse("Not Found", { status: 404 });
  }
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const body = await obj.Body?.transformToByteArray();
    if (!body) {
      logger.info("admin/proof: empty object", { adminId, targetUserId: userId });
      return new NextResponse("Not Found", { status: 404 });
    }
    const ext = path.extname(key).toLowerCase();
    const mapped = CONTENT_TYPE_BY_EXT[ext];
    const contentType = mapped ?? "application/octet-stream";
    const filename = `proof${mapped ? ext : ".bin"}`;
    logger.info("admin/proof: served", { adminId, targetUserId: userId });
    return new NextResponse(body as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    logger.info("admin/proof: fetch failed", { adminId, targetUserId: userId });
    return new NextResponse("Not Found", { status: 404 });
  }
}
