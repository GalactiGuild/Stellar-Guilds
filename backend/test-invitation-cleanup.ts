// Simple test script to verify the invitation cleanup functionality
// This can be run manually to test the cleanup service

import { PrismaService } from './src/prisma/prisma.service';
import { GuildInvitationCleanupService } from './src/guild/guild-invitation-cleanup.service';

async function testCleanup() {
  console.log('Testing invitation cleanup functionality...');
  
  // Initialize services (this would normally be done by NestJS DI)
  const prisma = new PrismaService();
  const cleanupService = new GuildInvitationCleanupService(prisma);
  
  try {
    // Test manual cleanup
    const result = await cleanupService.manualCleanup();
    console.log(`Cleanup test completed. Deleted ${result.deletedCount} expired invitations.`);
    
    // You can also call the scheduled method directly for testing
    // await cleanupService.cleanupExpiredInvitations();
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCleanup();
}

export { testCleanup };
