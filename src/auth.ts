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
// Wrapper to seed a placeholder nickname for OAuth users (User.nickname is
// required). Nicknames are not unique, so a single cuid-derived name is enough
// — onboarding replaces it with whatever the user wants to be called.
const adapter = {
  ...baseAdapter,
  createUser: async (
    data: Parameters<NonNullable<typeof baseAdapter.createUser>>[0],
  ) => {
    const nickname = `user-${cuid().slice(0, 8)}`;
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

// Stand-in hash so authorize() runs exactly one bcrypt.compare even for
// unknown emails (constant-time fail, no user-enumeration timing oracle).
const DUMMY_PASSWORD_HASH =
  "$2b$10$57aFuTsSK8XwllZ4l5ZdWORSnbKTMaZjcdyzZo/Wt5aWtYNeuY0li";

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
        // Constant-time fail: always run one bcrypt.compare (dummy hash when
        // the user is missing) so unknown emails are not faster to reject
        // than wrong passwords (no user-enumeration timing oracle).
        const ok = await bcrypt.compare(
          password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );
        if (!user?.passwordHash || !ok) return null;
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
            // Verified-email-only linking: a Google account may link to an
            // existing user solely when Google reports the email verified.
            allowDangerousEmailAccountLinking: false,
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

      // Full-claim cache stays at 60s; privilege claims (role / memberType /
      // clinicianStatus) refresh on a shorter 30s window so revocations and
      // clinician approvals propagate faster without re-reading the DB per request.
      const FULL_STALE_MS = 60_000;
      const PRIVILEGE_STALE_MS = 30_000;
      const t = token as Record<string, unknown>;
      const lastNumber = (key: string): number =>
        typeof t[key] === "number" ? (t[key] as number) : 0;

      const populate = (dbUser: {
        id: string;
        role: string;
        memberType: string;
        clinicianStatus: string;
        nickname: string;
        profileComplete: boolean;
        email: string | null;
      }) => {
        t.id = dbUser.id;
        t.role = dbUser.role;
        t.memberType = dbUser.memberType;
        t.clinicianStatus = dbUser.clinicianStatus;
        t.nickname = dbUser.nickname;
        t.profileComplete = dbUser.profileComplete;
        t.email = dbUser.email;
        t.lastVerified = now;
        t.lastPrivilegeVerified = now;
      };

      const populatePrivileges = (dbUser: {
        role: string;
        memberType: string;
        clinicianStatus: string;
      }) => {
        t.role = dbUser.role;
        t.memberType = dbUser.memberType;
        t.clinicianStatus = dbUser.clinicianStatus;
        t.lastPrivilegeVerified = now;
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

        // (2) Subsequent requests: token.id present -> full refetch if stale
        // >60s or trigger==='update'; privilege-only refetch if >30s stale.
        if (token?.id) {
          if (isEdge) return token;
          const lastVerified = lastNumber("lastVerified");
          const lastPrivilegeVerified =
            lastNumber("lastPrivilegeVerified") || lastVerified;
          if (now - lastVerified > FULL_STALE_MS || trigger === "update") {
            try {
              const dbUser = await prisma.user.findUnique({
                where: { id: token.id as string },
              });
              if (dbUser) {
                populate(dbUser);
              } else {
                t.lastVerified = now;
                t.lastPrivilegeVerified = now;
              }
            } catch {
              // keep token
            }
            return token;
          }
          if (now - lastPrivilegeVerified > PRIVILEGE_STALE_MS) {
            try {
              const dbUser = await prisma.user.findUnique({
                where: { id: token.id as string },
                select: {
                  role: true,
                  memberType: true,
                  clinicianStatus: true,
                },
              });
              if (dbUser) {
                populatePrivileges(dbUser);
              } else {
                t.lastPrivilegeVerified = now;
              }
            } catch {
              // keep token
            }
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
