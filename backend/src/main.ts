import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { WinstonLogger } from './logger/winston.logger';
import { ErrorReportingService } from './common/services/error-reporting.service';
import { StartupLogger, ServiceStatus } from './common/utils/startup-logger';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './common/services/redis.service';
import { ContentTypeEnforcementMiddleware } from './common/middleware/content-type-enforcement.middleware';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import * as express from 'express';
import * as path from 'path';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger('Bootstrap'),
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // Apply Correlation ID middleware globally
  const correlationIdMiddleware = new CorrelationIdMiddleware();
  app.use(correlationIdMiddleware.use.bind(correlationIdMiddleware));

  // Apply Content-Type enforcement middleware globally
  const contentTypeMiddleware = new ContentTypeEnforcementMiddleware();
  app.use(contentTypeMiddleware.use.bind(contentTypeMiddleware));
  app.use(
    compression({
      threshold: 1024,
      filter: (req, res) => {
        const contentType = String(res.getHeader('Content-Type') || '');
        if (contentType.includes('text/csv')) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );

  const logger = new WinstonLogger('Main');
  const httpAdapterHost = app.get(HttpAdapterHost);
  const errorReportingService = app.get(ErrorReportingService);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, errorReportingService),
  );

  // Apply response standardization globally
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(
    '/uploads',
    express.static(
      process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), 'uploads'),
    ),
  );

  const config = new DocumentBuilder()
    .setTitle('Stellar-Guilds')
    .setDescription('Stellar-Guilds API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;

  // Check service health before starting
  const serviceStatuses = await checkServiceHealth(app);

  await app.listen(port);

  // Log beautiful startup summary
  StartupLogger.logStartup({
    appName: 'Stellar-Guilds API',
    version: process.env.npm_package_version || '0.0.1',
    environment: process.env.NODE_ENV || 'development',
    port: port,
    swaggerEnabled: true,
    swaggerPath: '/docs',
    services: serviceStatuses,
  });

  logger.log(`Stellar-Guilds API listening on port ${port}`, 'Bootstrap');
}

/**
 * Check health of critical services
 */
async function checkServiceHealth(app: any): Promise<ServiceStatus[]> {
  const statuses: ServiceStatus[] = [];

  // Check Database (Prisma)
  try {
    const prismaService: PrismaService = app.get(PrismaService);
    await prismaService.$queryRaw`SELECT 1`;
    statuses.push({
      name: 'Database (Prisma)',
      status: 'connected',
      details: 'PostgreSQL connected',
    });
  } catch (error: any) {
    statuses.push({
      name: 'Database (Prisma)',
      status: 'error',
      details: error?.message || 'Connection failed',
    });
  }

  // Check Redis
  try {
    const redisService: RedisService = app.get(RedisService);
    await redisService.get('ping');
    statuses.push({
      name: 'Redis',
      status: 'connected',
      details: 'Cache & Sessions active',
    });
  } catch (error: any) {
    statuses.push({
      name: 'Redis',
      status: 'disconnected',
      details: 'Token blacklisting disabled',
    });
  }

  // Check Queue System (BullMQ)
  try {
    // If queue module is enabled, check it
    const queueModule = app.get('QueueModule', { strict: false });
    if (queueModule) {
      statuses.push({
        name: 'Queue System (BullMQ)',
        status: 'active',
        details: 'Background jobs enabled',
      });
    }
  } catch (error) {
    // Queue module might not be critical
    statuses.push({
      name: 'Queue System (BullMQ)',
      status: 'inactive',
      details: 'Background jobs disabled',
    });
  }

  // Throttler is always active (configured in app.module)
  statuses.push({
    name: 'Throttler',
    status: 'active',
    details: 'Rate limiting: 100 req/min',
  });

  // JWT Authentication
  statuses.push({
    name: 'JWT Authentication',
    status: 'active',
    details: 'Token blacklisting enabled',
  });

  return statuses;
}
bootstrap().catch((error) => {
  StartupLogger.logStartupError(error, 'Bootstrap');
  process.exit(1);
});
