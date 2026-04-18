-- AlterTable
ALTER TABLE "users" ADD COLUMN "notificationSettings" JSONB DEFAULT '{"emailOnBounty":true,"emailOnMention":true,"weeklyDigest":true}';
