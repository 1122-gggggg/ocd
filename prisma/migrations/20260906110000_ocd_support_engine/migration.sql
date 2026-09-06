-- CreateEnum
CREATE TYPE "SupportSourceType" AS ENUM ('POST', 'REPLY', 'CHAT', 'CHECKIN');

-- CreateEnum
CREATE TYPE "SupportDetectionType" AS ENUM ('REASSURANCE_SEEKING', 'COMPULSION_LOOP', 'CRISIS', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "SupportAction" AS ENUM ('EMPATHY_SHIELD', 'URGE_SURFING_PROMPT', 'LOOP_EDUCATION', 'CRISIS_ESCALATE');

-- CreateEnum
CREATE TYPE "PostSupportMode" AS ENUM ('EMPATHY', 'SHARE_EXPERIENCE', 'FACING_OCD', 'LOOKING_FOR_EXPERIENCE');

-- CreateEnum
CREATE TYPE "ReactionTargetType" AS ENUM ('POST', 'REPLY', 'VICTORY');

-- CreateEnum
CREATE TYPE "SupportReactionType" AS ENUM ('UNDERSTAND', 'HOLD_ON', 'RELATABLE', 'GRATEFUL', 'RESISTED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "supportMode" "PostSupportMode" NOT NULL DEFAULT 'EMPATHY';

-- CreateTable
CREATE TABLE "SupportInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" "SupportSourceType" NOT NULL,
    "sourceId" TEXT,
    "detectedType" "SupportDetectionType",
    "confidence" DOUBLE PRECISION,
    "userAction" "SupportAction",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "target" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "situation" TEXT NOT NULL,
    "compulsion" TEXT,
    "response" TEXT,
    "difficulty" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Victory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cheersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Victory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "ReactionTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reactionType" "SupportReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportInteraction_userId_createdAt_idx" ON "SupportInteraction"("userId", "createdAt");
CREATE INDEX "SupportInteraction_detectedType_createdAt_idx" ON "SupportInteraction"("detectedType", "createdAt");

-- CreateIndex
CREATE INDEX "RecoveryGoal_userId_active_idx" ON "RecoveryGoal"("userId", "active");

-- CreateIndex
CREATE INDEX "RecoveryLog_userId_createdAt_idx" ON "RecoveryLog"("userId", "createdAt");
CREATE INDEX "RecoveryLog_goalId_idx" ON "RecoveryLog"("goalId");

-- CreateIndex
CREATE INDEX "Victory_createdAt_idx" ON "Victory"("createdAt");
CREATE INDEX "Victory_userId_idx" ON "Victory"("userId");

-- CreateIndex
CREATE INDEX "SupportReaction_targetType_targetId_idx" ON "SupportReaction"("targetType", "targetId");
CREATE INDEX "SupportReaction_userId_idx" ON "SupportReaction"("userId");
CREATE UNIQUE INDEX "SupportReaction_userId_targetType_targetId_reactionType_key" ON "SupportReaction"("userId", "targetType", "targetId", "reactionType");

-- AddForeignKey
ALTER TABLE "SupportInteraction" ADD CONSTRAINT "SupportInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryGoal" ADD CONSTRAINT "RecoveryGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryLog" ADD CONSTRAINT "RecoveryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecoveryLog" ADD CONSTRAINT "RecoveryLog_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "RecoveryGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Victory" ADD CONSTRAINT "Victory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportReaction" ADD CONSTRAINT "SupportReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
