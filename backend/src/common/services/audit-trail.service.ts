import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);

  record(event: string, metadata: Record<string, unknown>) {
    this.logger.log(
      JSON.stringify({
        type: 'AUDIT_TRAIL',
        event,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
