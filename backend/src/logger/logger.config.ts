import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const jsonLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) =>
    JSON.stringify({
      timestamp,
      level: String(level).toUpperCase(),
      context: context || 'Application',
      message,
      ...(Object.keys(meta).length > 0 && { meta }),
    }),
  ),
);

export function createWinstonTransports(): winston.transport[] {
  if (process.env.NODE_ENV === 'production') {
    return [
      new DailyRotateFile({
        dirname: 'logs',
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        zippedArchive: true,
        format: jsonLogFormat,
      }),
      new DailyRotateFile({
        dirname: 'logs',
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d',
        zippedArchive: true,
        format: jsonLogFormat,
      }),
    ];
  }

  return [
    new winston.transports.Console({
      format: consoleLogFormat,
    }),
  ];
}

export function createWinstonLoggerOptions(): winston.LoggerOptions {
  return {
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'stellar-guilds' },
    transports: createWinstonTransports(),
  };
}
