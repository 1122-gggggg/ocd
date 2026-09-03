import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Opaque single-use tokens for password reset and email verification.
 *
 * The plaintext token is shown exactly once (in the emailed link). Only its
 * SHA-256 digest is persisted, so a database leak cannot be replayed against
 * /reset-password or /verify-email. 256 bits of entropy makes guessing
 * infeasible, which is why a plain (fast) hash is the right choice here —
 * unlike a user-chosen password there is nothing to brute force.
 */

/** Bytes of entropy per token. 32 bytes -> 43 base64url characters. */
const TOKEN_BYTES = 32;

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Generate a URL-safe token. Return value is the only copy of the plaintext. */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** Digest used as the stored lookup key. Stable across processes. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Constant-time comparison of two hex digests. Lookups go through the unique
 * index on `tokenHash` (which is not constant time), so this is belt-and-braces
 * for the places where two digests are compared directly.
 */
export function tokenHashEquals(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** True when the token row is still redeemable. */
export function isTokenLive(row: {
  expiresAt: Date;
  usedAt: Date | null;
}): boolean {
  return row.usedAt === null && row.expiresAt.getTime() > Date.now();
}
