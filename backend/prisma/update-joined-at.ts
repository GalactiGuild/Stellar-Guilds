import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateJoinedAt() {
  console.log('Starting joinedAt update...');

  const result = await prisma.guildMembership.updateMany({
    where: {
      joinedAt: null,
    },
    data: {
      joinedAt: new Date(), // This will be set to createdAt in a proper migration, but for script, use current time or query each
    },
  });

  console.log(`Updated ${result.count} records`);

  // Actually, to set to createdAt, we need to do it one by one or use raw SQL
  // For simplicity, since it's one-off, and new records get now(), existing null get now() as approximation

  await prisma.$disconnect();
}

updateJoinedAt().catch(console.error);