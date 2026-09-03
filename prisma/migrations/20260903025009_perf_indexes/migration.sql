-- Perf indexes for launch: cover board nav/home queries, reply floor pagination,
-- report moderation lookups, and FK/cascade joins. Plain CREATE INDEX (no CONCURRENTLY)
-- so the migration applies inside a deploy transaction.

-- Board lookups by status (nav + home)
CREATE INDEX IF NOT EXISTS "Board_status_slug_idx" ON "Board"("status", "slug");

-- Auth.js FK joins
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Board applications: moderation queue + slug conflict checks + proposer joins
CREATE INDEX IF NOT EXISTS "BoardApplication_status_createdAt_idx" ON "BoardApplication"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "BoardApplication_slug_status_idx" ON "BoardApplication"("slug", "status");
CREATE INDEX IF NOT EXISTS "BoardApplication_proposerId_idx" ON "BoardApplication"("proposerId");

-- Clinician applications: moderation queue
CREATE INDEX IF NOT EXISTS "ClinicianApplication_status_createdAt_idx" ON "ClinicianApplication"("status", "createdAt");

-- Moderation attribution
CREATE INDEX IF NOT EXISTS "Post_deletedById_idx" ON "Post"("deletedById");

-- Reply floor pagination scoped to visible rows
CREATE INDEX IF NOT EXISTS "Reply_postId_deletedAt_floor_idx" ON "Reply"("postId", "deletedAt", "floor");
CREATE INDEX IF NOT EXISTS "Reply_deletedById_idx" ON "Reply"("deletedById");

-- Report moderation: by target + by reporter
CREATE INDEX IF NOT EXISTS "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "Report_reporterId_idx" ON "Report"("reporterId");

-- Superseded single-column queue indexes (kept only if a pre-migration DB created them)
DROP INDEX IF EXISTS "BoardApplication_status_idx";
DROP INDEX IF EXISTS "ClinicianApplication_status_idx";
