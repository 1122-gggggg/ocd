import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { getClientIp, tryRedisCheck } from "./lib/rate-limit";
const { auth } = NextAuth(authConfig);

const withSession = auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth as unknown as {
    user?: {
      id?: string;
      role?: string;
      profileComplete?: boolean;
    };
  } | null;

  if (pathname.startsWith("/admin")) {
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  const isOnboarding = pathname === "/onboarding";
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";
  if (
    session?.user &&
    session.user.profileComplete === false &&
    !isOnboarding &&
    !isAuthRoute &&
    !isLogin &&
    !isRegister
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (!session?.user && isOnboarding) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  // POST rate limits (per-IP, per-instance best-effort), checked before
  // session/auth logic to shed load early. Auth routes get a tighter budget
  // to slow credential brute-force: 10 req / 60s; other POSTs 60 req / 60s.
  // 經 tryRedisCheck：有 REDIS_URL 走 Upstash 分散式計數，否則回退本地 Map；
  // 任何 throw 一律開放，避免限流故障擋掉正常流量。
  if (req.method === "POST") {
    const ip = getClientIp(req.headers);
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
    const limit = isAuthRoute ? 10 : 60;
    const key = isAuthRoute ? `mw:auth:POST:${ip}` : `mw:POST:${ip}`;
    try {
      const allowed = await tryRedisCheck(key, limit, 60_000);
      if (!allowed) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: { "Retry-After": "60" },
        });
      }
    } catch {
      // 失敗開放：限流不可用時放行，交給後續 auth 邏輯處理
    }
  }
  return (withSession as unknown as NextMiddleware)(req, event);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/onboarding",
    "/api/auth/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
