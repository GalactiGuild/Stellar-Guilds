import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HealthSummaryService } from './health-summary.service';

@Module({
  imports: [TerminusModule, PrismaModule, ScheduleModule.forRoot()],
  controllers: [HealthController],
  providers: [HealthSummaryService],
})
export class HealthModule {}
