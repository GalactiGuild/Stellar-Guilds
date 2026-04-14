import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLogInterceptor } from './audit.interceptor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuditService, AuditLogInterceptor],
  exports: [AuditService, AuditLogInterceptor],
  controllers: [],
})
export class AuditModule {}
