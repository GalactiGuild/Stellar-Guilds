-- AlterTable
ALTER TABLE "users" ADD COLUMN "discordId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");
