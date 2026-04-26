import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestProfilingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API Profile');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context
      .switchToHttp()
      .getRequest<{ method: string; path: string }>();
    const res = context.switchToHttp().getResponse<{ statusCode: number }>();
    const { method, path } = req;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(
          `[API Profile] ${method} ${path} ${res.statusCode} - ${ms}ms`,
        );
      }),
    );
  }
}
