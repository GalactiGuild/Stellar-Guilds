import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DailyHealthLogService } from './daily-health-log.service';

@Module({
  imports: [TerminusModule, PrismaModule, ScheduleModule.forRoot()],
  controllers: [HealthController],
  providers: [DailyHealthLogService],
})
export class HealthModule {}
