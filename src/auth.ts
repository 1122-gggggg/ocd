import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/db";
import { authConfig } from "./auth.config";

const googleConfigured =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

const baseAdapter = PrismaAdapter(prisma);
// Wrapper to ensure nickname for OAuth users (User.nickname is required unique)
const adapter: any = {
  ...baseAdapter,
  createUser: async (data: Record<string, unknown>) => {
    const provisionalId = (data.id as string | undefined) ?? Math.random().toString(36).slice(2, 10);
    const nickname = `user-${String(provisionalId).slice(0, 8)}`;
    const withNickname = {
      ...data,
      nickname,
      profileComplete: false,
    };
    return (baseAdapter.createUser as any)(withNickname);
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
    async jwt({ token, user }) {
      // Edge runtime cannot use Prisma; skip DB lookup there
      const isEdge = process.env.NEXT_RUNTIME === "edge";
      if (user?.id) {
        if (isEdge) {
          token.id = user.id as string;
          return token;
        }
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.memberType = dbUser.memberType;
            token.clinicianStatus = dbUser.clinicianStatus;
            token.nickname = dbUser.nickname;
            token.profileComplete = dbUser.profileComplete;
            token.email = dbUser.email;
          }
        } catch {
          // keep token
        }
      } else if (token?.id) {
        if (isEdge) return token;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.memberType = dbUser.memberType;
            token.clinicianStatus = dbUser.clinicianStatus;
            token.nickname = dbUser.nickname;
            token.profileComplete = dbUser.profileComplete;
            token.email = dbUser.email;
          }
        } catch {
          // keep token
        }
      }
      if (token.email && !token.nickname) {
        if (isEdge) return token;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.nickname = dbUser.nickname;
            token.profileComplete = dbUser.profileComplete;
            token.role = dbUser.role;
            token.memberType = dbUser.memberType;
            token.clinicianStatus = dbUser.clinicianStatus;
          }
        } catch {
          // keep
        }
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
