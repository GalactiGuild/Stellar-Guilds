import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { WinstonLogger } from './logger/winston.logger';
import * as express from 'express';
import * as path from 'path';

function logStartupSummary(
  logger: WinstonLogger,
  port: string | number,
) {
  const env = process.env.NODE_ENV || 'development';
  const version = process.env.npm_package_version || '1.0.0';

  const lines = [
    '┌─────────────────────────────────────────────────────┐',
    `│  Stellar-Guilds API v${version.padEnd(30)}│`,
    `│  Environment: ${env.padEnd(37)}│`,
    `│  Port: ${String(port).padEnd(43)}│`,
    '├─────────────────────────────────────────────────────┤',
    '│  Dependencies                                       │',
    '│    ✓ PostgreSQL (Prisma)                            │',
    '│    ✓ Swagger UI: /docs                              │',
    '│    ✓ Throttler: Active (100 req/60s)                │',
    '│    ✓ BullMQ Queue: Ready                            │',
    '│    ✓ Winston Logger: Active                         │',
    '├─────────────────────────────────────────────────────┤',
    '│  Static Files: /uploads                             │',
    '│  Health Check: /health                              │',
    '└─────────────────────────────────────────────────────┘',
  ];

  for (const line of lines) {
    logger.log(line, 'Startup');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger('Bootstrap'),
  });

  const logger = new WinstonLogger('Main');
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

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
  await app.listen(port);

  logStartupSummary(logger, port);
}
bootstrap().catch((error) => {
  const logger = new WinstonLogger('Bootstrap');
  logger.error('Failed to start application', error.stack, 'Bootstrap');
  process.exit(1);
});
