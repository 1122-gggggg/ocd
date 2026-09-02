import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" as const },
  callbacks: {
    authorized() {
      // Let middleware handle redirects; allow all to pass to middleware handler
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
