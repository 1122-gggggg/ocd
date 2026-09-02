import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { preferRequestHost } from "./lib/prefer-request-host";

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
  // Clear stale AUTH_URL before Auth.js rewrites the request origin.
  preferRequestHost();
  return (withSession as unknown as NextMiddleware)(req, event);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/onboarding",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
