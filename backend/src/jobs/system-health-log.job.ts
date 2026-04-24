import { Injectable, Logger } from '@nestjs/common';

export interface HealthSnapshot {
  timestamp: string;
  uptime: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  nodeVersion: string;
  status: 'healthy' | 'degraded';
}

@Injectable()
export class SystemHealthLogJob {
  private readonly logger = new Logger(SystemHealthLogJob.name);

  collectSnapshot(): HealthSnapshot {
    const mem = process.memoryUsage();
    const memUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
    const memTotalMb = Math.round(mem.heapTotal / 1024 / 1024);

    return {
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memoryUsedMb: memUsedMb,
      memoryTotalMb: memTotalMb,
      nodeVersion: process.version,
      status: memUsedMb / memTotalMb > 0.9 ? 'degraded' : 'healthy',
    };
  }

  runDailyLog(): void {
    const snapshot = this.collectSnapshot();
    this.logger.log('Daily system health snapshot', JSON.stringify(snapshot));
  }
}
