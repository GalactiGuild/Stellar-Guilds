/**
 * Join Date Normalization Script
 *
 * One-off script to normalize join dates for guild members.
 * Finds records with null joinedAt and sets them to the record's createdAt.
 *
 * Usage:
 *   npx ts-node backend/prisma/scripts/normalize-join-dates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting join date normalization...');

  // Find records with null joinedAt
  const nullRecords = await prisma.guildMembership.findMany({
    where: {
      joinedAt: null,
    },
    select: {
      id: true,
      createdAt: true,
      userId: true,
      guildId: true,
    },
  });

  console.log(`Found ${nullRecords.length} records with null joinedAt`);

  if (nullRecords.length === 0) {
    console.log('No records to normalize. All good!');
    return;
  }

  // Update records using createdAt as the fallback
  const result = await prisma.$executeRaw`
    UPDATE guild_memberships
    SET "joinedAt" = "createdAt"
    WHERE "joinedAt" IS NULL
  `;

  console.log(`Normalized ${result} join date records`);

  // Verify
  const remaining = await prisma.guildMembership.count({
    where: { joinedAt: null },
  });

  console.log(`Remaining null joinedAt records: ${remaining}`);
}

main()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
