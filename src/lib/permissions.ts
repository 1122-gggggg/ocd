type UserLike = {
  id: string;
  role: string;
  clinicianStatus: string;
} | null | undefined;

type BoardLike = {
  status: string;
  slug: string;
};

type PostLike = {
  deletedAt: Date | string | null | undefined;
};

export function canCreatePost(user: UserLike, board: BoardLike): boolean {
  if (!user) return false;
  if (board.status !== "ACTIVE") return false;
  if (board.slug === "announcements") {
    return user.role === "ADMIN";
  }
  if (board.slug === "clinical") {
    return user.clinicianStatus === "VERIFIED";
  }
  return true;
}

export function canReply(
  user: UserLike,
  board: BoardLike,
  post: PostLike
): boolean {
  if (!user) return false;
  if (board.status !== "ACTIVE") return false;
  if (post.deletedAt != null) return false;
  return true;
}

export function canSeeAuthor(
  viewer: UserLike,
  authorId: string
): boolean {
  if (!viewer) return false;
  return viewer.role === "ADMIN" || viewer.id === authorId;
}
