import * as winston from 'winston';
import { ConsoleLogger } from '@nestjs/common';
import { createWinstonLoggerOptions } from './logger.config';

export class WinstonLogger extends ConsoleLogger {
  private winstonLogger!: winston.Logger;

  constructor(context?: string) {
    super(context || 'Application');
    super(context || 'App');
    this.winstonLogger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(
        ({ timestamp, level, message, context, ...meta }: any) => {
          let correlationId: string | undefined;
          try {
            // Lazy import to avoid circular dependencies during initialization if any
            const {
              requestContext,
            } = require('../../common/utils/async-storage');
            const store = requestContext.getStore();
            correlationId = store?.get('correlationId');
          } catch (e) {
            // Ignore if async-storage isn't available
          }

          return JSON.stringify({
            timestamp,
            level: String(level).toUpperCase(),
            context: context || 'Application',
            correlationId,
            message,
            ...(Object.keys(meta).length > 0 && { meta }),
          });
        },
      ),
    );

    return winston.createLogger({
      ...createWinstonLoggerOptions(),
      format: logFormat,
    });
  }

  log(message: string, context?: string) {
    this.winstonLogger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.winstonLogger.error(message, {
      context: context || this.context,
      stack: trace,
    });
  }

  warn(message: string, context?: string) {
    this.winstonLogger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.winstonLogger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.winstonLogger.debug(message, { context: context || this.context });
  }
}
