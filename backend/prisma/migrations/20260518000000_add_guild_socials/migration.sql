-- Add structured social links for guild public profiles.
ALTER TABLE "guilds" ADD COLUMN "socials" JSONB DEFAULT '{}';
