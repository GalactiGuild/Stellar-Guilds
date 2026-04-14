import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { AUDIT_ACTION_KEY } from './log-audit.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.userId;
    const params = request.params;

    // Determine entity type and ID from route params
    let entityType: string | undefined;
    let entityId: string | undefined;

    if (params.guildId) {
      entityType = 'GUILD';
      entityId = params.guildId;
    } else if (params.userId) {
      entityType = 'USER';
      entityId = params.userId;
    } else if (params.bountyId) {
      entityType = 'BOUNTY';
      entityId = params.bountyId;
    }

    return next.handle().pipe(
      tap({
        next: () => {
          // Log after successful handler execution
          this.auditService.recordAction({
            userId,
            action,
            entityType,
            entityId,
            metadata: {
              method: request.method,
              url: request.url,
              ip: request.ip,
            },
          });
        },
        error: (err) => {
          this.logger.warn(
            `Audit: action ${action} failed for user ${userId}: ${err.message}`,
          );
        },
      }),
    );
  }
}
