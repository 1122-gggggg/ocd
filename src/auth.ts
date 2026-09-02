import "./lib/prefer-request-host";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { createId as cuid } from "@paralleldrive/cuid2";
import { prisma } from "./lib/db";
import { authConfig } from "./auth.config";

const googleConfigured =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

const baseAdapter = PrismaAdapter(prisma);
// Wrapper to ensure nickname for OAuth users (User.nickname is required unique)
// Uses cuid() with uniqueness loop to avoid collisions under concurrency
const adapter = {
  ...baseAdapter,
  createUser: async (
    data: Parameters<NonNullable<typeof baseAdapter.createUser>>[0],
  ) => {
    let nickname: string | null = null;
    // Try up to 5 attempts to find a unique nickname
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `user-${cuid().slice(0, 8)}`;
      try {
        const existing = await prisma.user.findUnique({
          where: { nickname: candidate },
        });
        if (!existing) {
          nickname = candidate;
          break;
        }
      } catch {
        // On DB error, use candidate and let DB constraint handle it
        nickname = candidate;
        break;
      }
    }
    if (!nickname) {
      nickname = `user-${cuid().slice(0, 8)}`;
    }
    const withNickname = {
      ...data,
      nickname,
      profileComplete: false,
    } as Parameters<NonNullable<typeof baseAdapter.createUser>>[0];
    // PrismaAdapter.createUser expects AdapterUser shape; use unknown cast with reason: library type is narrower than runtime data
    const createUserFn = baseAdapter.createUser as unknown as (
      d: Parameters<NonNullable<typeof baseAdapter.createUser>>[0],
    ) => Promise<Parameters<NonNullable<typeof baseAdapter.createUser>>[0]>;
    return createUserFn(withNickname);
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
        };
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // Edge runtime cannot use Prisma; skip DB lookup there
      const isEdge = process.env.NEXT_RUNTIME === "edge";
      const now = Date.now();

      const populate = (dbUser: {
        id: string;
        role: string;
        memberType: string;
        clinicianStatus: string;
        nickname: string;
        profileComplete: boolean;
        email: string | null;
      }) => {
        (token as Record<string, unknown>).id = dbUser.id;
        (token as Record<string, unknown>).role = dbUser.role;
        (token as Record<string, unknown>).memberType = dbUser.memberType;
        (token as Record<string, unknown>).clinicianStatus =
          dbUser.clinicianStatus;
        (token as Record<string, unknown>).nickname = dbUser.nickname;
        (token as Record<string, unknown>).profileComplete =
          dbUser.profileComplete;
        (token as Record<string, unknown>).email = dbUser.email;
        (token as Record<string, unknown>).lastVerified = now;
      };

      try {
        // (1) Initial login: user.id present -> fetch once and populate
        if (user?.id) {
          if (isEdge) {
            (token as Record<string, unknown>).id = user.id as string;
            return token;
          }
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id as string },
            });
            if (dbUser) {
              populate(dbUser);
            } else {
              (token as Record<string, unknown>).id = user.id as string;
              (token as Record<string, unknown>).lastVerified = now;
            }
          } catch {
            // keep token
            (token as Record<string, unknown>).id = user.id as string;
          }
          return token;
        }

        // (3) OAuth fallback: token has email but no id (once) -> single email lookup
        if (!token.id && token.email) {
          if (isEdge) return token;
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email as string },
            });
            if (dbUser) {
              populate(dbUser);
            }
          } catch {
            // keep token
          }
          return token;
        }

        // (2) Subsequent requests: token.id present -> only refetch if stale >60s or trigger==='update'
        if (token?.id) {
          if (isEdge) return token;
          const lastVerified =
            typeof (token as Record<string, unknown>).lastVerified === "number"
              ? ((token as Record<string, unknown>).lastVerified as number)
              : 0;
          const isStale = now - lastVerified > 60_000;
          const shouldRefresh = isStale || trigger === "update";
          if (!shouldRefresh) {
            return token;
          }
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
            });
            if (dbUser) {
              populate(dbUser);
            } else {
              (token as Record<string, unknown>).lastVerified = now;
            }
          } catch {
            // keep token
          }
          return token;
        }
      } catch {
        // keep token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as unknown as Record<string, unknown>).id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).memberType = token.memberType;
        (session.user as unknown as Record<string, unknown>).clinicianStatus = token.clinicianStatus;
        (session.user as unknown as Record<string, unknown>).nickname = token.nickname;
        (session.user as unknown as Record<string, unknown>).profileComplete = token.profileComplete;
        if (token.email) session.user.email = token.email as string;
        if (token.nickname) session.user.name = token.nickname as string;
      }
      return session;
    },
  },
});
