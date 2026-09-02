// DATABASE_URL must be pooled (PgBouncer) for serverless — MUST include
// ?sslmode=require&pgbouncer=true&connection_limit=10 (Neon -pooler host).
// DIRECT_URL is direct (no pooler/pgbouncer) for `prisma migrate deploy`.
// See .env.example and DEPLOY_VERCEL_NEON.md for Neon templates.
import { PrismaClient } from "@prisma/client";

// Runtime warning: pooled host without pgbouncer flag will exhaust connections on Vercel
if (
  typeof process.env.DATABASE_URL === "string" &&
  process.env.DATABASE_URL.includes("-pooler") &&
  !process.env.DATABASE_URL.includes("pgbouncer=true")
) {
  console.warn(
    "[prisma] DATABASE_URL looks pooled (-pooler) but missing pgbouncer=true — " +
      "add ?pgbouncer=true&connection_limit=10 (see .env.example)"
  );
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient = globalThis.prisma ?? createPrismaClient();

// Always cache on globalThis to avoid exhausting connections in serverless / hot-reload
if (!globalThis.prisma) globalThis.prisma = prisma;

// Gracefully handle initial connection errors (don't crash on import)
prisma.$connect().catch((e) => {
  console.error("[prisma] $connect failed:", e);
});

export default prisma;
