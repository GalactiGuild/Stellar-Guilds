-- AlterTable
ALTER TABLE "users" ADD COLUMN "technicalTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
