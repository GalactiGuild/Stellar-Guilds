-- Add reminderSent column to bounties table
-- This column tracks whether a reminder email has been sent for a bounty nearing expiration

ALTER TABLE "bounties"
ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- Create an index for efficient querying of bounties needing reminders
CREATE INDEX IF NOT EXISTS "bounties_reminder_sent_idx" ON "bounties"("reminderSent");

-- Create an index for deadline queries combined with status
CREATE INDEX IF NOT EXISTS "bounties_deadline_status_idx" ON "bounties"("deadline", "status");
