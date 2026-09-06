import { NextRequest, NextResponse } from "next/server";
import { getChatMessages } from "@/app/actions/chat";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") || "general";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const after = searchParams.get("after") || undefined;

  try {
    const messages = await getChatMessages(channel, limit, after);
    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    console.error("[api/chat] error:", error);
    return NextResponse.json(
      { ok: false, message: "讀取聊天訊息失敗" },
      { status: 500 }
    );
  }
}
