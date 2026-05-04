import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GuildModule } from './guild/guild.module';
import { BountyModule } from './bounty/bounty.module';
import { SocialModule } from './social/social.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';
import { QueueModule } from './queue/queue.module';
import { ProxylModule } from './proxyl/proxyl.module';
import { ReputationModule } from './reputation/reputation.module';
import { VersionModule } from './version/version.module';
import { SearchModule } from './search/search.module';
import { ErrorReportingModule } from './common/modules/error-reporting.module';
import { RedisModule } from './common/services/redis.module';
import { MaintenanceGuard } from './common/guards/maintenance.guard';
import { ErrorCodeTestController } from './common/controllers/error-code-test.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisThrottlerStorage } from './common/services/redis-throttler.storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_EXPIRATION: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .default('15m'),
        JWT_REFRESH_EXPIRATION: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .default('7d'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        THROTTLE_REDIS_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
        THROTTLE_TTL_MS: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),
        THROTTLE_BLOCK_MS: Joi.number().default(60000),
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: new RedisThrottlerStorage(configService),
        getTracker: (req: Record<string, unknown>) => {
          const headers = (req.headers ?? {}) as Record<string, string | string[] | undefined>;
          const forwardedFor = headers['x-forwarded-for'];
          if (typeof forwardedFor === 'string') {
            return forwardedFor.split(',')[0].trim();
          }
          if (Array.isArray(forwardedFor) && typeof forwardedFor[0] === 'string') {
            return forwardedFor[0].split(',')[0].trim();
          }
          return String(req.ip ?? 'unknown');
        },
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL_MS', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT', 100),
            blockDuration: configService.get<number>('THROTTLE_BLOCK_MS', 60000),
          },
        ],
      }),
    }),
    LoggerModule,
    ErrorReportingModule,
    RedisModule,
    PrismaModule,
    AuthModule,
    UserModule,
    GuildModule,
    BountyModule,
    SocialModule,
    HealthModule,
    QueueModule,
    ProxylModule,
    ReputationModule,
    VersionModule,
    SearchModule,
  ],
  controllers: [AppController, ErrorCodeTestController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
  ],
})
export class AppModule {}
