import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogRecord {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async recordAction(record: AuditLogRecord) {
    try {
      const logEntry = await this.prisma.auditLog.create({
        data: {
          userId: record.userId,
          action: record.action,
          entityType: record.entityType,
          entityId: record.entityId,
          metadata: record.metadata || {},
        },
      });

      this.logger.debug(
        `Audit logged: ${record.action} on ${record.entityType}/${record.entityId} by user ${record.userId}`,
      );

      return logEntry;
    } catch (err: any) {
      // Don't throw — audit logging should not break business flows
      this.logger.error(`Failed to write audit log: ${err.message}`);
      return null;
    }
  }

  async getLogs(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    page?: number;
    size?: number;
  }) {
    const page = filters?.page ?? 0;
    const size = filters?.size ?? 50;

    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters?.entityType) where.entityType = filters.entityType;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, size };
  }
}
