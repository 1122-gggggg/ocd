import { NextRequest, NextResponse } from "next/server";
import { getChatMessages } from "@/app/actions/chat";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") || "general";

  // SSE 即時串流：?stream=1 回 text/event-stream，每 2s 推增量訊息
  if (searchParams.get("stream") === "1") {
    const initialAfter = searchParams.get("after") || undefined;
    let cursor: string | undefined = initialAfter;
    const encoder = new TextEncoder();
    let timer: NodeJS.Timeout | undefined;
    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;
        const close = () => {
          if (closed) return;
          closed = true;
          if (timer !== undefined) {
            clearInterval(timer);
            timer = undefined;
          }
          try {
            controller.close();
          } catch {
            // 忽略重複關閉
          }
        };
        req.signal.addEventListener("abort", close);
        const push = async () => {
          if (closed || req.signal.aborted) {
            close();
            return;
          }
          try {
            const messages = await getChatMessages(channel, 20, cursor);
            if (closed || req.signal.aborted) {
              close();
              return;
            }
            if (messages.length > 0) {
              cursor = messages[messages.length - 1]?.createdAt ?? cursor;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ messages })}\n\n`)
              );
            } else {
              controller.enqueue(encoder.encode(`: ping\n\n`));
            }
          } catch {
            // DB 短暫失敗時不斷線，下個 tick 再試
          }
        };
        await push();
        timer = setInterval(push, 2000);
      },
      cancel() {
        if (timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

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
