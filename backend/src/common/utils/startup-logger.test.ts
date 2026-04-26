import { StartupLogger } from './startup-logger';

// Simple test to demonstrate the startup logger
console.log('Testing Startup Logger...\n');

// Test 1: Successful startup with all services
StartupLogger.logStartup({
  appName: 'Stellar-Guilds API',
  version: '1.0.0',
  environment: 'development',
  port: 3000,
  swaggerEnabled: true,
  swaggerPath: '/docs',
  services: [
    {
      name: 'Database (Prisma)',
      status: 'connected',
      details: 'PostgreSQL connected',
    },
    {
      name: 'Redis',
      status: 'connected',
      details: 'Cache & Sessions active',
    },
    {
      name: 'Queue System (BullMQ)',
      status: 'active',
      details: 'Background jobs enabled',
    },
    {
      name: 'Throttler',
      status: 'active',
      details: 'Rate limiting: 100 req/min',
    },
    {
      name: 'JWT Authentication',
      status: 'active',
      details: 'Token blacklisting enabled',
    },
  ],
});

// Test 2: Startup with some services disconnected
setTimeout(() => {
  console.log('\nTesting with disconnected services...\n');

  StartupLogger.logStartup({
    appName: 'Stellar-Guilds API',
    version: '1.0.0',
    environment: 'production',
    port: 8080,
    swaggerEnabled: false,
    services: [
      {
        name: 'Database (Prisma)',
        status: 'connected',
        details: 'PostgreSQL connected',
      },
      {
        name: 'Redis',
        status: 'disconnected',
        details: 'Token blacklisting disabled',
      },
      {
        name: 'Queue System (BullMQ)',
        status: 'inactive',
        details: 'Background jobs disabled',
      },
      {
        name: 'Throttler',
        status: 'active',
        details: 'Rate limiting: 100 req/min',
      },
      {
        name: 'JWT Authentication',
        status: 'active',
        details: 'Token blacklisting enabled',
      },
    ],
  });
}, 1000);

// Test 3: Error case
setTimeout(() => {
  console.log('\nTesting error case...\n');

  const testError = new Error('Database connection refused');
  testError.stack = `Error: Database connection refused
    at PrismaService.connect (/src/prisma/prisma.service.ts:28:5)
    at bootstrap (/src/main.ts:15:3)`;

  StartupLogger.logStartupError(testError, 'Database Connection');
}, 2000);
