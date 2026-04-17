import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      message = (response as any).message || exception.message;
    } else if (
      exception &&
      typeof exception === 'object' &&
      (exception.type === 'entity.too.large' || exception.status === 413)
    ) {
      // Handle Express body parser payload too large errors
      httpStatus = HttpStatus.PAYLOAD_TOO_LARGE;
      message = 'Payload too large';
    } else if (
      exception &&
      typeof exception === 'object' &&
      (exception.constructor.name === 'PrismaClientKnownRequestError' ||
        exception.name === 'PrismaClientKnownRequestError')
    ) {
      // Handle Prisma errors
      switch (exception.code) {
        case 'P2002':
          httpStatus = HttpStatus.CONFLICT;
          message = `Unique constraint failed on the fields: ${(exception.meta?.target as string[])?.join(', ')}`;
          break;
        case 'P2003':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        case 'P2025':
          httpStatus = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = `Prisma error: ${exception.message}`;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
