import { describe, it, expect } from "vitest";
import { containsCrisisKeyword } from "./crisis-keywords";

describe("containsCrisisKeyword", () => {
  it("detects 想死", () => {
    expect(containsCrisisKeyword("我最近一直想死")).toBe(true);
  });
  it("detects SUICIDE case-insensitive", () => {
    expect(containsCrisisKeyword("I think about SUICIDE a lot")).toBe(true);
  });
  it("returns false for normal content", () => {
    expect(containsCrisisKeyword("ERP 練習今天做得不錯")).toBe(false);
  });
  it("detects mixed case kill myself", () => {
    expect(containsCrisisKeyword("Kill Myself thoughts")).toBe(true);
  });
  it("returns false for empty", () => {
    expect(containsCrisisKeyword("")).toBe(false);
  });
});
