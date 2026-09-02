import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { r2, R2_BUCKET } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = (await auth()) as unknown as { user?: { role: string } } | null;
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Not Found", { status: 404 });
  }
  const { userId } = await params;
  const app = await prisma.clinicianApplication.findUnique({ where: { userId } });
  if (!app?.proofPath) return new NextResponse("Not Found", { status: 404 });
  if (app.proofPath.startsWith("r2://")) {
    if (!r2) return new NextResponse("Not Found", { status: 404 });
    const key = app.proofPath.replace(`r2://${R2_BUCKET}/`, "");
    try {
      const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
      const body = await obj.Body?.transformToByteArray();
      if (!body) return new NextResponse("Not Found", { status: 404 });
      const ext = path.extname(key).toLowerCase();
      let contentType = obj.ContentType || "application/octet-stream";
      if (!obj.ContentType) {
        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".pdf") contentType = "application/pdf";
      }
      return new NextResponse(body as unknown as BodyInit, {
        headers: { "Content-Type": contentType },
      });
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return new NextResponse("migrated to R2", { status: 404 });
}
