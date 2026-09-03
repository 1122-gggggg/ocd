import { afterEach, describe, expect, it } from "vitest";
import { getCanonicalHost, isAllowedHost } from "./prefer-request-host";

const KEYS = [
  "VERCEL",
  "VERCEL_URL",
  "AUTH_URL",
  "NEXTAUTH_URL",
  "AUTH_TRUST_HOST",
] as const;

function useSnapshot() {
  const snapshot: Record<string, string | undefined> = {};
  function capture() {
    for (const key of KEYS) snapshot[key] = process.env[key];
  }
  afterEach(() => {
    for (const key of KEYS) {
      delete process.env[key];
      if (snapshot[key] !== undefined) process.env[key] = snapshot[key];
    }
  });
  return { capture };
}

describe("getCanonicalHost", () => {
  const { capture } = useSnapshot();

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
  const { capture } = useSnapshot();

  it("allows the canonical host", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("ocd.goodman.tw")).toBe(true);
  });

  it("allows VERCEL_URL", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    process.env.VERCEL_URL = "ocd-abc123.vercel.app";

    expect(isAllowedHost("ocd-abc123.vercel.app")).toBe(true);
  });

  it("allows *.vercel.app", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("preview-xyz.vercel.app")).toBe(true);
  });

  it("allows loopback hosts", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("localhost")).toBe(true);
    expect(isAllowedHost("127.0.0.1")).toBe(true);
  });

  // IPv6 loopback allowlisted (impl checks ::1 before :port strip).
  it("allows IPv6 loopback ::1", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("::1")).toBe(true);
  });

  it("rejects external and empty hosts when canonical is set", () => {
    capture();
    process.env.AUTH_URL = "https://ocd.goodman.tw";
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("evil.com")).toBe(false);
    expect(isAllowedHost("")).toBe(false);
    expect(isAllowedHost(null)).toBe(false);
    expect(isAllowedHost(undefined)).toBe(false);
  });

  it("allows any non-empty host when canonical is null (AUTH_URL unset)", () => {
    capture();
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(getCanonicalHost()).toBeNull();
    expect(isAllowedHost("ocd.goodman.tw")).toBe(true);
    expect(isAllowedHost("evil.com")).toBe(true);
    expect(isAllowedHost("preview-xyz.vercel.app")).toBe(true);
  });

  it("still rejects empty hosts when canonical is null", () => {
    capture();
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    expect(isAllowedHost("")).toBe(false);
    expect(isAllowedHost(null)).toBe(false);
    expect(isAllowedHost(undefined)).toBe(false);
  });
});
