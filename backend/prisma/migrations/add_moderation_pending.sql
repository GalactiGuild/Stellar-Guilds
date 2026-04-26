-- Migration: Add MODERATION_PENDING status to MembershipStatus enum
-- This migration adds the MODERATION_PENDING status to the guild_memberships table

-- First, update any existing records that might need the new status (optional)
-- No data migration needed since we're just adding a new enum value

-- Drop the existing check constraint if it exists
ALTER TABLE guild_memberships DROP CONSTRAINT IF EXISTS guild_memberships_status_check;

-- Add the new enum value to the status column
ALTER TYPE "MembershipStatus" ADD VALUE 'MODERATION_PENDING';

-- Recreate the check constraint to include the new status
ALTER TABLE guild_memberships 
ADD CONSTRAINT guild_memberships_status_check 
CHECK (status IN ('MODERATION_PENDING', 'PENDING', 'APPROVED', 'REJECTED'));
