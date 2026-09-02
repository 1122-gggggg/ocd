import { describe, it, expect } from "vitest";
import { NICKNAME_MAX, normalizeNickname } from "./nickname";

describe("normalizeNickname", () => {
  it("trims surrounding whitespace but keeps the name intact", () => {
    expect(normalizeNickname("  小明  ")).toBe("小明");
  });

  it("preserves inner spaces, symbols and emoji", () => {
    expect(normalizeNickname("🌸 今天 也還在 🌸")).toBe("🌸 今天 也還在 🌸");
    expect(normalizeNickname("^_^ ***")).toBe("^_^ ***");
  });

  it("treats whitespace-only input as empty", () => {
    expect(normalizeNickname("   ")).toBe("");
    expect(normalizeNickname(null)).toBe("");
    expect(normalizeNickname(undefined)).toBe("");
  });
});

describe("nickname rules", () => {
  it("accepts a single character (there is no minimum length)", () => {
    expect(normalizeNickname("a").length).toBeGreaterThan(0);
  });

  it("allows names far longer than the old 24-character cap", () => {
    const long = "非常長的暱稱".repeat(10); // 60 chars
    expect(normalizeNickname(long)).toBe(long);
    expect(long.length).toBeLessThanOrEqual(NICKNAME_MAX);
  });

  it("keeps a generous storage cap so requests stay bounded", () => {
    expect(NICKNAME_MAX).toBeGreaterThanOrEqual(100);
  });
});
