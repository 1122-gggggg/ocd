import { afterEach, describe, expect, it } from "vitest";
import { preferRequestHost } from "./prefer-request-host";

const KEYS = ["VERCEL", "AUTH_URL", "NEXTAUTH_URL", "AUTH_TRUST_HOST"] as const;

describe("preferRequestHost", () => {
  const snapshot: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const key of KEYS) {
      delete process.env[key];
      if (snapshot[key] !== undefined) process.env[key] = snapshot[key];
    }
  });

  function capture() {
    for (const key of KEYS) snapshot[key] = process.env[key];
  }

  it("clears AUTH_URL on Vercel so Auth.js uses the request Host", () => {
    capture();
    process.env.VERCEL = "1";
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    process.env.NEXTAUTH_URL = "https://ocd-9q1zdz2fo-90608star-2630.vercel.app";
    delete process.env.AUTH_TRUST_HOST;

    preferRequestHost();

    expect(process.env.AUTH_URL).toBe("");
    expect(process.env.NEXTAUTH_URL).toBe("");
    expect(process.env.AUTH_TRUST_HOST).toBe("true");
  });

  it("does not touch AUTH_URL off Vercel", () => {
    capture();
    delete process.env.VERCEL;
    process.env.AUTH_URL = "http://localhost:3001";

    preferRequestHost();

    expect(process.env.AUTH_URL).toBe("http://localhost:3001");
  });
});
