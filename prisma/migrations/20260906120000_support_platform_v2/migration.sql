-- AlterTable
ALTER TABLE "SupportInteraction" ADD COLUMN "recommendedAction" TEXT,
ADD COLUMN "outcome" TEXT,
ADD COLUMN "metadata" JSONB;

-- AlterTable
ALTER TABLE "Victory" DROP COLUMN "cheersCount";

-- AlterTable
ALTER TABLE "RecoveryLog" ALTER COLUMN "situation" DROP NOT NULL,
ADD COLUMN "trigger" TEXT,
ADD COLUMN "urge" TEXT,
ADD COLUMN "difficultyBefore" INTEGER,
ADD COLUMN "difficultyAfter" INTEGER,
ADD COLUMN "durationSeconds" INTEGER,
ADD COLUMN "compulsionResisted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SupportPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredSupportMode" "PostSupportMode" NOT NULL DEFAULT 'EMPATHY',
    "hideSensitiveTopics" BOOLEAN NOT NULL DEFAULT false,
    "preferredTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowPeerMatching" BOOLEAN NOT NULL DEFAULT true,
    "showRecoveryPrompts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportPreference_userId_key" ON "SupportPreference"("userId");

-- CreateIndex
CREATE INDEX "SupportPreference_userId_idx" ON "SupportPreference"("userId");

-- AddForeignKey
ALTER TABLE "SupportPreference" ADD CONSTRAINT "SupportPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
