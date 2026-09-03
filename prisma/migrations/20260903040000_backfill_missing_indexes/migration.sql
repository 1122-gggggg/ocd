-- Backfill schema-declared indexes never created by any migration.
-- Pre-existing drift: init migration only emitted UNIQUE indexes, leaving these 6 plain @@indexes uncreated.
CREATE INDEX IF NOT EXISTS "Post_boardId_deletedAt_createdAt_idx" ON "Post"("boardId", "deletedAt", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_boardId_createdAt_idx" ON "Post"("boardId", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "Reply_postId_createdAt_idx" ON "Reply"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "Reply_authorId_idx" ON "Reply"("authorId");
CREATE INDEX IF NOT EXISTS "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
