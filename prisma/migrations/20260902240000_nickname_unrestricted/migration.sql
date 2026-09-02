-- Nicknames are no longer restricted: any text, any length, duplicates allowed.
-- Drop the uniqueness constraint and keep a plain index so lookups by nickname
-- (admin search, moderation) stay cheap.
DROP INDEX IF EXISTS "User_nickname_key";

CREATE INDEX IF NOT EXISTS "User_nickname_idx" ON "User"("nickname");
