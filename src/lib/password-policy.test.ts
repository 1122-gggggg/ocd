import { describe, it, expect } from "vitest";
import { PASSWORD_MIN, validatePassword } from "./password-policy";

describe("validatePassword", () => {
  it("accepts an ordinary password", () => {
    expect(validatePassword("correct horse battery")).toBeNull();
  });

  it("accepts non-latin passwords at full strength", () => {
    // Length is counted in code units, not bytes, so CJK is not penalised.
    expect(validatePassword("我的密碼很長很長")).toBeNull();
  });

  it("rejects anything shorter than the minimum", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN - 1))).toContain(String(PASSWORD_MIN));
    expect(validatePassword("")).toContain(String(PASSWORD_MIN));
  });

  it("rejects an absurdly long password rather than hashing it", () => {
    expect(validatePassword("x".repeat(201))).toBe("密碼過長");
  });

  it("rejects a password built from the account's email local part", () => {
    expect(validatePassword("alice12345", { email: "alice@example.org" })).toBe(
      "密碼不能包含你的 Email",
    );
  });

  it("matches the email local part case-insensitively", () => {
    expect(validatePassword("ALICE-is-here", { email: "alice@example.org" })).toBe(
      "密碼不能包含你的 Email",
    );
  });

  it("ignores a very short local part, which would reject too much", () => {
    // "ann" appears inside plenty of reasonable passwords ("annoyance…").
    expect(validatePassword("annoyingly-long", { email: "ann@example.org" })).toBeNull();
  });

  it("rejects a password containing the nickname", () => {
    // Long enough to clear the length rule, which is checked first.
    expect(validatePassword("煙霧測試-my-password", { nickname: "煙霧測試" })).toBe(
      "密碼不能包含你的暱稱",
    );
  });

  it("trims the nickname before comparing", () => {
    expect(validatePassword("xxxx煙霧測試xxxx", { nickname: "  煙霧測試  " })).toBe(
      "密碼不能包含你的暱稱",
    );
  });

  it("rejects a single repeated character", () => {
    expect(validatePassword("aaaaaaaaaa")).toBe("密碼不能是同一個字元重複");
    expect(validatePassword("！！！！！！！！")).toBe("密碼不能是同一個字元重複");
  });

  it("tolerates a missing or null context", () => {
    expect(validatePassword("a-fine-password")).toBeNull();
    expect(validatePassword("a-fine-password", { email: null, nickname: null })).toBeNull();
  });
});
