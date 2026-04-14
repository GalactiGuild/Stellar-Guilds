import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string()
          .min(16)
          .required()
          .messages({
            'string.min': 'JWT_SECRET must be at least 16 characters',
            'any.required': 'Missing Configuration: JWT_SECRET',
          }),
        REDIS_HOST: Joi.string().optional(),
        REDIS_PORT: Joi.number().optional(),
        REDIS_URL: Joi.string().optional(),
      }),
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds in milliseconds
        limit: 100, // 100 requests per 60 seconds
      },
    ]),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UserModule,
    GuildModule,
    BountyModule,
    SocialModule,
    HealthModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
