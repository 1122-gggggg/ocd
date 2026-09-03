import { auth } from "@/auth";
import { buildUserExport } from "@/lib/account";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit-db";

/**
 * Self-service data export (個資法 / GDPR portability).
 *
 * Returns everything the site holds about the signed-in member as a single JSON
 * attachment. Rate limited because it is the most expensive read a normal
 * account can trigger, and never cached — the response is personal data.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const gate = await enforceRateLimit(`export:${userId}`, 3, 60 * 60 * 1000);
  if (!gate.allowed) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "retry-after": String(Math.ceil(gate.resetMs / 1000)) },
    });
  }

  const data = await buildUserExport(userId);
  if (!data) return new Response("Not Found", { status: 404 });

  logger.info("account: data exported", {
    userId,
    posts: data.counts.posts,
    replies: data.counts.replies,
  });

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="ocd-export-${stamp}.json"`,
      "cache-control": "no-store, private",
    },
  });
}
