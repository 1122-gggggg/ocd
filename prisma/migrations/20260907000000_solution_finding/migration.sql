-- Solution-finding upgrade: tags, helpful votes, notifications, full-text search
-- Safe to run on an empty database; all alters/adds are idempotent.

-- AlterTable: Post solution-finding columns
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isSolved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "solvedReplyId" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "helpfulCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "search_tsv" tsvector;

-- AlterTable: Reply full-text column
ALTER TABLE "Reply" ADD COLUMN IF NOT EXISTS "search_tsv" tsvector;

-- CreateTable: Tag
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");

-- CreateTable: PostTag
CREATE TABLE IF NOT EXISTS "PostTag" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PostTag_postId_tagId_key" ON "PostTag"("postId", "tagId");
CREATE INDEX IF NOT EXISTS "PostTag_postId_idx" ON "PostTag"("postId");
CREATE INDEX IF NOT EXISTS "PostTag_tagId_idx" ON "PostTag"("tagId");
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PostTag_postId_fkey'
    ) THEN
        ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey"
            FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PostTag_tagId_fkey'
    ) THEN
        ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey"
            FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- CreateTable: HelpfulVote
CREATE TABLE IF NOT EXISTS "HelpfulVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HelpfulVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HelpfulVote_userId_targetType_targetId_key" ON "HelpfulVote"("userId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS "HelpfulVote_targetType_targetId_idx" ON "HelpfulVote"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "HelpfulVote_userId_idx" ON "HelpfulVote"("userId");
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'HelpfulVote_userId_fkey'
    ) THEN
        ALTER TABLE "HelpfulVote" ADD CONSTRAINT "HelpfulVote_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- CreateTable: Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipientId" TEXT,
    "postId" TEXT,
    "replyId" TEXT,
    "kind" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX IF NOT EXISTS "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_recipientId_readAt_idx" ON "Notification"("recipientId", "readAt");
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey'
    ) THEN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- Full-text search: GIN indexes
CREATE INDEX IF NOT EXISTS "Post_search_tsv_idx" ON "Post" USING GIN ("search_tsv");
CREATE INDEX IF NOT EXISTS "Reply_search_tsv_idx" ON "Reply" USING GIN ("search_tsv");

-- Full-text search: trigger functions (Post title + bodyMd, Reply bodyMd)
CREATE OR REPLACE FUNCTION sync_post_search_tsv() RETURNS trigger AS $$
BEGIN
    NEW."search_tsv" := to_tsvector('simple', coalesce(NEW."title", '') || ' ' || coalesce(NEW."bodyMd", ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_post_search_tsv_trigger ON "Post";
CREATE TRIGGER sync_post_search_tsv_trigger
    BEFORE INSERT OR UPDATE OF "title", "bodyMd" ON "Post"
    FOR EACH ROW EXECUTE FUNCTION sync_post_search_tsv();

CREATE OR REPLACE FUNCTION sync_reply_search_tsv() RETURNS trigger AS $$
BEGIN
    NEW."search_tsv" := to_tsvector('simple', coalesce(NEW."bodyMd", ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_reply_search_tsv_trigger ON "Reply";
CREATE TRIGGER sync_reply_search_tsv_trigger
    BEFORE INSERT OR UPDATE OF "bodyMd" ON "Reply"
    FOR EACH ROW EXECUTE FUNCTION sync_reply_search_tsv();

-- Backfill existing rows (no-op on empty tables)
UPDATE "Post" SET "search_tsv" = to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("bodyMd", '')) WHERE "search_tsv" IS NULL;
UPDATE "Reply" SET "search_tsv" = to_tsvector('simple', coalesce("bodyMd", '')) WHERE "search_tsv" IS NULL;
