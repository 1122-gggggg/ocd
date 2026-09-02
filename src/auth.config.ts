import "./lib/prefer-request-host";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" as const },
  callbacks: {
    authorized() {
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
