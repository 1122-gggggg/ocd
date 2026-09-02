import { canSeeAuthor } from "./permissions";

type ViewerLike = {
  id: string;
  role: string;
} | null | undefined;

type AuthorLike = {
  id: string;
  nickname: string;
  memberType: string;
  clinicianStatus: string;
};

type ContentLike = {
  isAnonymous: boolean;
  author: AuthorLike;
  authorId: string;
};

export type AuthorDisplay = {
  label: string;
  badge: string | null;
  /**
   * True whenever the post was submitted anonymously — including the
   * admin-visible case where the real nickname is appended. Callers must use
   * this rather than sniffing the label, since nicknames are free-form and a
   * user may legitimately be called "匿名".
   */
  anonymous: boolean;
};

export function publicAuthorLabel(
  content: ContentLike,
  viewer: ViewerLike
): AuthorDisplay {
  const viewerForCheck = viewer as unknown as {
    id: string;
    role: string;
    clinicianStatus: string;
  } | null | undefined;
  const isAnon =
    content.isAnonymous && !canSeeAuthor(viewerForCheck, content.authorId);
  if (isAnon) {
    return { label: "匿名", badge: null, anonymous: true };
  }
  const author = content.author;
  let badge: string | null = null;
  if (author.memberType === "PATIENT") badge = "病友";
  else if (author.memberType === "FAMILY") badge = "家屬";
  else if (
    author.memberType === "CLINICIAN" &&
    author.clinicianStatus === "VERIFIED"
  ) {
    badge = "已驗證臨床";
  } else if (author.memberType === "CLINICIAN") {
    badge = null;
  }

  if (content.isAnonymous && canSeeAuthor(viewerForCheck, content.authorId)) {
    return {
      label: `匿名（管理員可見：${author.nickname}）`,
      badge,
      anonymous: true,
    };
  }

  return { label: author.nickname, badge, anonymous: false };
}

export function authorBadge(
  memberType: string,
  clinicianStatus: string
): string | null {
  if (memberType === "PATIENT") return "病友";
  if (memberType === "FAMILY") return "家屬";
  if (memberType === "CLINICIAN" && clinicianStatus === "VERIFIED")
    return "已驗證臨床";
  return null;
}
