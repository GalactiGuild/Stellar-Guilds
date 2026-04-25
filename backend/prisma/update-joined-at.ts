import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateJoinedAt() {
  console.log('Starting joinedAt update...');

  // Use raw SQL to update records where joinedAt is null, set to createdAt
  await prisma.$executeRaw`
    UPDATE "guild_memberships"
    SET "joinedAt" = "createdAt"
    WHERE "joinedAt" IS NULL
  `;

  console.log('Update completed');

  await prisma.$disconnect();
}

updateJoinedAt().catch(console.error);