import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerOptions } from './logger.config';
import { LoggerMiddleware } from './logger.middleware';
import { WinstonLogger } from './winston.logger';

@Module({
  imports: [WinstonModule.forRoot(createWinstonLoggerOptions())],
  providers: [LoggerMiddleware, WinstonLogger],
  exports: [LoggerMiddleware, WinstonLogger],
})
export class LoggerModule {}
