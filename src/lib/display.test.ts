import { describe, it, expect } from "vitest";
import { publicAuthorLabel, authorBadge } from "./display";

describe("publicAuthorLabel", () => {
  const author = {
    id: "user-1",
    nickname: "小明",
    memberType: "PATIENT",
    clinicianStatus: "NONE",
  };

  it("shows nickname and badge for non-anonymous content", () => {
    const res = publicAuthorLabel(
      { isAnonymous: false, author, authorId: author.id },
      null
    );
    expect(res).toEqual({
      label: "小明",
      badge: "病友",
      anonymous: false,
    });
  });

  it("masks author as '匿名' for guest viewers on anonymous content", () => {
    const res = publicAuthorLabel(
      { isAnonymous: true, author, authorId: author.id },
      null
    );
    expect(res).toEqual({
      label: "匿名",
      badge: null,
      anonymous: true,
    });
  });

  it("masks author as '匿名' for other normal users", () => {
    const viewer = { id: "user-2", role: "USER", clinicianStatus: "NONE" };
    const res = publicAuthorLabel(
      { isAnonymous: true, author, authorId: author.id },
      viewer
    );
    expect(res).toEqual({
      label: "匿名",
      badge: null,
      anonymous: true,
    });
  });

  it("reveals author nickname to admins on anonymous content", () => {
    const admin = { id: "admin-1", role: "ADMIN", clinicianStatus: "NONE" };
    const res = publicAuthorLabel(
      { isAnonymous: true, author, authorId: author.id },
      admin
    );
    expect(res).toEqual({
      label: "匿名（管理員可見：小明）",
      badge: "病友",
      anonymous: true,
    });
  });

  it("reveals transparent message to the author themselves", () => {
    const self = { id: "user-1", role: "USER", clinicianStatus: "NONE" };
    const res = publicAuthorLabel(
      { isAnonymous: true, author, authorId: author.id },
      self
    );
    expect(res).toEqual({
      label: "匿名（管理員可見：小明）",
      badge: "病友",
      anonymous: true,
    });
  });

  it("assigns verified clinician badge correctly", () => {
    const clinician = {
      id: "dr-1",
      nickname: "王醫師",
      memberType: "CLINICIAN",
      clinicianStatus: "VERIFIED",
    };
    const res = publicAuthorLabel(
      { isAnonymous: false, author: clinician, authorId: clinician.id },
      null
    );
    expect(res.badge).toBe("已驗證臨床");
  });

  it("assigns family badge correctly", () => {
    const family = {
      id: "fam-1",
      nickname: "家屬阿華",
      memberType: "FAMILY",
      clinicianStatus: "NONE",
    };
    const res = publicAuthorLabel(
      { isAnonymous: false, author: family, authorId: family.id },
      null
    );
    expect(res.badge).toBe("家屬");
  });
});

describe("authorBadge", () => {
  it("returns appropriate badge string or null", () => {
    expect(authorBadge("PATIENT", "NONE")).toBe("病友");
    expect(authorBadge("FAMILY", "NONE")).toBe("家屬");
    expect(authorBadge("CLINICIAN", "VERIFIED")).toBe("已驗證臨床");
    expect(authorBadge("CLINICIAN", "PENDING")).toBe(null);
    expect(authorBadge("CLINICIAN", "NONE")).toBe(null);
  });
});
