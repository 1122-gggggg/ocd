import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth as unknown as {
    user?: {
      id?: string;
      role?: string;
      profileComplete?: boolean;
    };
  } | null;

  // Admin protection
  if (pathname.startsWith("/admin")) {
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Onboarding guard: if logged in but profile incomplete and not on allowed paths
  const isOnboarding = pathname === "/onboarding";
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";
  // Allow static assets already excluded by matcher, but double-check
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

  // If profileComplete false and trying to access onboarding when already complete? Allow.
  // If not logged in and hits onboarding, redirect to login
  if (!session?.user && isOnboarding) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/onboarding",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
