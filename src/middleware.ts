import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { preferRequestHost } from "./lib/prefer-request-host";
import { checkRateLimit, getClientIp } from "./lib/rate-limit";
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

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // POST rate limits (per-IP, per-instance best-effort), checked before
  // session/auth logic to shed load early. Auth routes get a tighter budget
  // to slow credential brute-force: 10 req / 60s; other POSTs 60 req / 60s.
  if (req.method === "POST") {
    const ip = getClientIp(req.headers);
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
    const limit = isAuthRoute ? 10 : 60;
    const key = isAuthRoute ? `mw:auth:POST:${ip}` : `mw:POST:${ip}`;
    if (!checkRateLimit(key, limit, 60_000)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }
  }
  // Drop a stale AUTH_URL only when it mismatches this request's host.
  preferRequestHost(
    req.headers.get("x-forwarded-host") ?? req.headers.get("host"),
  );
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
