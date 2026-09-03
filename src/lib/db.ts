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

// NOTE: lazy-connect by design — PrismaClient connects on first query.
// Do NOT call prisma.$connect() on import: it opens a connection in every
// serverless cold-start / build-time import and exhausts the pool.
export default prisma;

