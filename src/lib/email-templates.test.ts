import { describe, it, expect } from "vitest";
import {
  accountDeletedEmail,
  passwordResetEmail,
  reportAlertEmail,
  verifyEmailEmail,
} from "./email-templates";

const URL_ = "https://example.org/reset-password?token=abc-123_XYZ";

describe("password reset email", () => {
  const mail = passwordResetEmail("alice@example.org", URL_, 60);

  it("puts the link in the plain-text body, for clients that strip HTML", () => {
    expect(mail.text).toContain(URL_);
  });

  it("puts the link in the HTML body twice — button and copyable text", () => {
    const occurrences = mail.html!.split("example.org/reset-password").length - 1;
    expect(occurrences).toBe(2);
  });

  it("states the expiry so the reader knows to act now", () => {
    expect(mail.text).toContain("60");
  });

  it("tells a recipient who did not ask for it to do nothing", () => {
    expect(mail.text).toContain("忽略這封信");
  });
});

describe("subject lines", () => {
  it("name the site but not the condition", () => {
    // An inbox preview is visible to anyone glancing at a phone. The site name
    // is unavoidable; nothing beyond it should describe why the person is here.
    const subjects = [
      passwordResetEmail("a@b.co", URL_, 60).subject,
      verifyEmailEmail("a@b.co", URL_, 24).subject,
      accountDeletedEmail("a@b.co", true).subject,
    ];
    for (const s of subjects) {
      expect(s).toContain("強迫症互助坊");
      expect(s.replace("強迫症互助坊", "")).not.toContain("強迫症");
    }
  });
});

describe("account deleted email", () => {
  it("says what happened to the member's writing", () => {
    expect(accountDeletedEmail("a@b.co", true).text).toContain("保留發文");
    expect(accountDeletedEmail("a@b.co", false).text).toContain("一併刪除");
  });
});

describe("report alert email", () => {
  const base = {
    count: 3,
    targetType: "POST",
    reason: "內容涉及攻擊",
    adminUrl: "https://example.org/admin/reports",
    crisis: false,
  };

  it("carries the queue depth and a link straight to the queue", () => {
    const mail = reportAlertEmail("admin@example.org", base);
    expect(mail.subject).toContain("3");
    expect(mail.text).toContain(base.adminUrl);
    expect(mail.text).toContain(base.reason);
  });

  it("flags a crisis-keyword hit in the subject, where it is seen first", () => {
    const mail = reportAlertEmail("admin@example.org", { ...base, crisis: true });
    expect(mail.subject).toContain("危機");
    expect(mail.text).toContain("危機");
  });

  it("labels replies differently from posts", () => {
    expect(reportAlertEmail("a@b.co", { ...base, targetType: "REPLY" }).text).toContain(
      "回覆",
    );
    expect(reportAlertEmail("a@b.co", base).text).toContain("貼文");
  });

  it("escapes HTML in the member-written reason", () => {
    const mail = reportAlertEmail("a@b.co", {
      ...base,
      reason: '<img src=x onerror="alert(1)">',
    });
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;img");
  });
});
