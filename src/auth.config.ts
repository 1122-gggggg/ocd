import type { NextAuthConfig } from "next-auth";
import { isAllowedHost } from "./lib/prefer-request-host";

export const authConfig = {
  // Vercel sits behind a proxy with dynamic hosts: trustHost must stay true
  // so Auth.js accepts the forwarded Host. Host-poisoning is rejected below
  // in authorized() via the allowlist (AUTH_URL hostname + VERCEL_URL +
  // *.vercel.app + loopback).
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" as const },
  callbacks: {
    authorized({ request }) {
      // Reject Host-poisoned requests before any session/auth logic runs.
      const host =
        request.headers.get("x-forwarded-host") ??
        request.headers.get("host");
      if (!isAllowedHost(host)) return false;
      // Let middleware handle redirects; allow all to pass to middleware handler
      return true;
    },
    // Edge middleware uses this file only (no Prisma). Copy JWT claims onto session.
    session({ session, token }) {
      if (session.user) {
        const user = session.user as unknown as Record<string, unknown>;
        user.id = token.id;
        user.role = token.role;
        user.memberType = token.memberType;
        user.clinicianStatus = token.clinicianStatus;
        user.nickname = token.nickname;
        user.profileComplete = token.profileComplete;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
