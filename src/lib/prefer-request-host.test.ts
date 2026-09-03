import { afterEach, describe, expect, it } from "vitest";
import {
  getCanonicalHost,
  isAllowedHost,
  preferRequestHost,
} from "./prefer-request-host";

const KEYS = [
  "VERCEL",
  "VERCEL_URL",
  "AUTH_URL",
  "NEXTAUTH_URL",
  "AUTH_TRUST_HOST",
] as const;

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

  it("is a no-op with no host arg (env untouched)", () => {
    capture();
    process.env.VERCEL = "1";
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    process.env.NEXTAUTH_URL = "https://ocd-9q1zdz2fo-90608star-2630.vercel.app";
    delete process.env.AUTH_TRUST_HOST;

    preferRequestHost();

    expect(process.env.AUTH_URL).toBe("https://ocd.goodman.tw");
    expect(process.env.NEXTAUTH_URL).toBe(
      "https://ocd-9q1zdz2fo-90608star-2630.vercel.app",
    );
    expect(process.env.AUTH_TRUST_HOST).toBeUndefined();
  });

  it("does not touch env off Vercel even with a host arg", () => {
    capture();
    delete process.env.VERCEL;
    process.env.AUTH_URL = "http://localhost:3001";
    process.env.NEXTAUTH_URL = "http://localhost:3001";
    delete process.env.AUTH_TRUST_HOST;

    preferRequestHost("something.vercel.app");

    expect(process.env.AUTH_URL).toBe("http://localhost:3001");
    expect(process.env.NEXTAUTH_URL).toBe("http://localhost:3001");
    expect(process.env.AUTH_TRUST_HOST).toBeUndefined();
  });

  it("deletes stale AUTH_URL on Vercel when allowlisted request host mismatches canonical", () => {
    capture();
    process.env.VERCEL = "1";
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    process.env.NEXTAUTH_URL = "https://ocd-9q1zdz2fo-90608star-2630.vercel.app";
    delete process.env.AUTH_TRUST_HOST;

    preferRequestHost("ocd-9q1zdz2fo-90608star-2630.vercel.app");

    expect(process.env.AUTH_URL).toBeUndefined();
    expect(process.env.NEXTAUTH_URL).toBeUndefined();
    expect(process.env.AUTH_TRUST_HOST).toBe("true");
  });

  it("keeps AUTH_URL when request host matches canonical", () => {
    capture();
    process.env.VERCEL = "1";
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    process.env.NEXTAUTH_URL = "https://ocd.goodman.tw";
    delete process.env.AUTH_TRUST_HOST;

    preferRequestHost("ocd.goodman.tw");

    expect(process.env.AUTH_URL).toBe("https://ocd.goodman.tw");
    expect(process.env.NEXTAUTH_URL).toBe("https://ocd.goodman.tw");
    expect(process.env.AUTH_TRUST_HOST).toBe("true");
  });

  it("keeps AUTH_URL on poisoned (non-allowlisted) host", () => {
    capture();
    process.env.VERCEL = "1";
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    process.env.NEXTAUTH_URL = "https://ocd.goodman.tw";
    delete process.env.AUTH_TRUST_HOST;

    preferRequestHost("evil.com");

    expect(process.env.AUTH_URL).toBe("https://ocd.goodman.tw");
    expect(process.env.NEXTAUTH_URL).toBe("https://ocd.goodman.tw");
  });
});

describe("getCanonicalHost", () => {
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

  it("returns the AUTH_URL hostname", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw/api/auth";
    delete process.env.NEXTAUTH_URL;

    expect(getCanonicalHost()).toBe("ocd.goodman.tw");
  });

  it("falls back to NEXTAUTH_URL when AUTH_URL is unset", () => {
    capture();
    delete process.env.AUTH_URL;
    process.env.NEXTAUTH_URL = "https://ocd-abc123.vercel.app";

    expect(getCanonicalHost()).toBe("ocd-abc123.vercel.app");
  });

  it("returns null on empty env", () => {
    capture();
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;

    expect(getCanonicalHost()).toBeNull();
  });

  it("returns null on garbage URL", () => {
    capture();
    process.env.AUTH_URL = "not a url";
    delete process.env.NEXTAUTH_URL;

    expect(getCanonicalHost()).toBeNull();
  });
});

describe("isAllowedHost", () => {
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

  it("allows the canonical host", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("ocd.goodman.tw")).toBe(true);
  });

  it("allows VERCEL_URL", () => {
    capture();
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    process.env.VERCEL_URL = "ocd-abc123.vercel.app";

    expect(isAllowedHost("ocd-abc123.vercel.app")).toBe(true);
  });

  it("allows *.vercel.app", () => {
    capture();
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("preview-xyz.vercel.app")).toBe(true);
  });

  it("allows loopback hosts", () => {
    capture();
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("localhost")).toBe(true);
    expect(isAllowedHost("127.0.0.1")).toBe(true);
  });

  // IPv6 loopback allowlisted (impl checks ::1 before :port strip).
  it("allows IPv6 loopback ::1", () => {
    capture();
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("::1")).toBe(true);
  });

  it("rejects external and empty hosts", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("evil.com")).toBe(false);
    expect(isAllowedHost("")).toBe(false);
    expect(isAllowedHost(null)).toBe(false);
    expect(isAllowedHost(undefined)).toBe(false);
  });
});
