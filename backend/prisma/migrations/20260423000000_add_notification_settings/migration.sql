-- Add notificationSettings column to users table
ALTER TABLE "users" ADD COLUMN "notificationSettings" JSONB DEFAULT '{"emailOnBounty":true,"emailOnMention":true,"weeklyDigest":true}';
