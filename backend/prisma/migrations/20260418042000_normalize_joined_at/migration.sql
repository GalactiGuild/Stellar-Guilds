-- Add default value to joinedAt column
ALTER TABLE "guild_memberships" ALTER COLUMN "joinedAt" SET DEFAULT now();

-- Backfill existing records where joinedAt is NULL using createdAt as fallback
UPDATE "guild_memberships"
SET "joinedAt" = "createdAt"
WHERE "joinedAt" IS NULL;
