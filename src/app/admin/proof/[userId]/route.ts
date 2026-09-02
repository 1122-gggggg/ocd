import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

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

  const baseDir = path.resolve("uploads/clinician-proof");
  const resolved = path.resolve(app.proofPath);
  if (!resolved.startsWith(baseDir)) {
    return new NextResponse("Not Found", { status: 404 });
  }
  try {
    const data = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".pdf") contentType = "application/pdf";
    return new NextResponse(data, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
