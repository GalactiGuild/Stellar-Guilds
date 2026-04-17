-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE 'MODERATION_PENDING';

-- AlterTable
ALTER TABLE "guild_memberships" ADD COLUMN "message" TEXT,
ADD COLUMN "reviewedById" TEXT,
ADD COLUMN "reviewMessage" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "guild_memberships" ADD CONSTRAINT "guild_memberships_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
