import { describe, it, expect } from "vitest";
import {
  EMAIL_VERIFICATION_TTL_MS,
  PASSWORD_RESET_TTL_MS,
  generateToken,
  hashToken,
  isTokenLive,
  tokenHashEquals,
} from "./tokens";

describe("generateToken", () => {
  it("is URL-safe so it survives an email client and a query string", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateToken()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("never repeats", () => {
    const seen = new Set(Array.from({ length: 500 }, () => generateToken()));
    expect(seen.size).toBe(500);
  });

  it("carries at least 256 bits", () => {
    // 32 random bytes base64url-encode to 43 characters.
    expect(generateToken().length).toBeGreaterThanOrEqual(43);
  });
});

describe("hashToken", () => {
  it("is deterministic, so a link minted in one process verifies in another", () => {
    const token = generateToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("does not leak the token", () => {
    const token = generateToken();
    expect(hashToken(token)).not.toContain(token);
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("separates tokens that differ by one character", () => {
    expect(hashToken("aaaaaaaa")).not.toBe(hashToken("aaaaaaab"));
  });
});

describe("tokenHashEquals", () => {
  it("matches identical digests and rejects everything else", () => {
    const a = hashToken("one");
    expect(tokenHashEquals(a, a)).toBe(true);
    expect(tokenHashEquals(a, hashToken("two"))).toBe(false);
    expect(tokenHashEquals(a, "short")).toBe(false);
    expect(tokenHashEquals("", "")).toBe(true);
  });
});

describe("isTokenLive", () => {
  const future = () => new Date(Date.now() + 60_000);
  const past = () => new Date(Date.now() - 60_000);

  it("accepts an unused token that has not expired", () => {
    expect(isTokenLive({ expiresAt: future(), usedAt: null })).toBe(true);
  });

  it("rejects a spent token even when it has not expired", () => {
    expect(isTokenLive({ expiresAt: future(), usedAt: new Date() })).toBe(false);
  });

  it("rejects an expired token", () => {
    expect(isTokenLive({ expiresAt: past(), usedAt: null })).toBe(false);
  });
});

describe("token lifetimes", () => {
  it("gives a reset link an hour and a verification link a day", () => {
    expect(PASSWORD_RESET_TTL_MS).toBe(60 * 60 * 1000);
    expect(EMAIL_VERIFICATION_TTL_MS).toBe(24 * 60 * 60 * 1000);
    // A reset grant is the more dangerous of the two, so it must be shorter.
    expect(PASSWORD_RESET_TTL_MS).toBeLessThan(EMAIL_VERIFICATION_TTL_MS);
  });
});
