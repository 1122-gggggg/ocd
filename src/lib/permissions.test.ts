import { describe, it, expect } from "vitest";
import { canCreatePost, canReply } from "./permissions";

describe("canCreatePost", () => {
  const activeBoard = (slug: string) => ({ status: "ACTIVE", slug });
  const pendingBoard = (slug: string) => ({ status: "PENDING", slug });

  it("guest cannot create", () => {
    expect(canCreatePost(null, activeBoard("newcomers"))).toBe(false);
    expect(canCreatePost(undefined, activeBoard("newcomers"))).toBe(false);
  });

  it("USER cannot post to announcements", () => {
    const user = { id: "u1", role: "USER", clinicianStatus: "NONE" };
    expect(canCreatePost(user, activeBoard("announcements"))).toBe(false);
  });

  it("ADMIN can post to announcements", () => {
    const admin = { id: "a1", role: "ADMIN", clinicianStatus: "NONE" };
    expect(canCreatePost(admin, activeBoard("announcements"))).toBe(true);
  });

  it("unverified clinician cannot post to clinical", () => {
    const user = { id: "u1", role: "USER", clinicianStatus: "NONE" };
    expect(canCreatePost(user, activeBoard("clinical"))).toBe(false);
    const pending = { id: "u2", role: "USER", clinicianStatus: "PENDING" };
    expect(canCreatePost(pending, activeBoard("clinical"))).toBe(false);
  });

  it("verified clinician can post to clinical", () => {
    const verified = { id: "u3", role: "USER", clinicianStatus: "VERIFIED" };
    expect(canCreatePost(verified, activeBoard("clinical"))).toBe(true);
  });

  it("user can post to normal board", () => {
    const user = { id: "u1", role: "USER", clinicianStatus: "NONE" };
    expect(canCreatePost(user, activeBoard("newcomers"))).toBe(true);
  });

  it("cannot post to non-active board", () => {
    const user = { id: "u1", role: "USER", clinicianStatus: "NONE" };
    expect(canCreatePost(user, pendingBoard("newcomers"))).toBe(false);
  });

  it("USER can reply in clinical (allowed)", () => {
    const user = { id: "u1", role: "USER", clinicianStatus: "NONE" };
    const board = activeBoard("clinical");
    const post = { deletedAt: null };
    expect(canReply(user, board, post)).toBe(true);
  });

  it("cannot reply if board not active", () => {
    const user = { id: "u1", role: "USER", clinicianStatus: "NONE" };
    expect(canReply(user, pendingBoard("clinical"), { deletedAt: null })).toBe(false);
  });

  it("cannot reply if post deleted", () => {
    const user = { id: "u1", role: "USER", clinicianStatus: "NONE" };
    expect(canReply(user, activeBoard("newcomers"), { deletedAt: new Date() })).toBe(false);
  });

  it("guest cannot reply", () => {
    expect(canReply(null, activeBoard("newcomers"), { deletedAt: null })).toBe(false);
  });
});
