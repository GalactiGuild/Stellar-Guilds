import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorReportingService } from '../services/error-reporting.service';
import { StellarErrorCode } from '../errors/stellar-error-code.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly errorReportingService: ErrorReportingService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: StellarErrorCode = StellarErrorCode.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      message = (response as any).message || exception.message;
      errorCode =
        (exception as any).errorCode ??
        (response as any)?.errorCode ??
        this.getDefaultErrorCodeByStatus(httpStatus);
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
          errorCode = StellarErrorCode.PRISMA_UNIQUE_CONSTRAINT;
          break;
        case 'P2003':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          errorCode = StellarErrorCode.PRISMA_FOREIGN_KEY_CONSTRAINT;
          break;
        case 'P2025':
          httpStatus = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          errorCode = StellarErrorCode.PRISMA_RECORD_NOT_FOUND;
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = `Prisma error: ${exception.message}`;
          errorCode = StellarErrorCode.BAD_REQUEST;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const path = httpAdapter.getRequestUrl(request);

    // Report 5xx server errors to the error reporting service
    if (httpStatus >= 500) {
      try {
        const userAgent = request.headers['user-agent'];
        const ip = request.ip || request.connection.remoteAddress;
        const method = request.method;
        const userId = request.user?.userId; // If available from auth

        // Trigger error reporting asynchronously (non-blocking)
        this.errorReportingService
          .reportServerError(exception, path, method, userAgent, ip, userId)
          .catch(() => {
            // Error reporting failure should not affect the main error response
          });
      } catch (reportingError) {
        // Ensure error reporting itself doesn't cause cascade failures
        console.error('Error reporting failed:', reportingError);
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path,
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }

  private getDefaultErrorCodeByStatus(httpStatus: number): StellarErrorCode {
    switch (httpStatus) {
      case HttpStatus.BAD_REQUEST:
        return StellarErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return StellarErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return StellarErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return StellarErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return StellarErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return StellarErrorCode.RATE_LIMIT_EXCEEDED;
      default:
        return StellarErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
