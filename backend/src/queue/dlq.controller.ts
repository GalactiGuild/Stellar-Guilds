import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DlqService } from './dlq.service';

@Controller('admin/dlq')
export class DlqController {
  constructor(private readonly dlqService: DlqService) {}

  @Get(':type')
  listFailed(@Param('type') type: string) {
    return this.dlqService.listFailedJobs(type);
  }

  @Post(':type/replay/:jobId')
  replay(@Param('type') type: string, @Param('jobId') jobId: string) {
    return this.dlqService.replayJob(type, jobId);
  }

  @Post(':type/resolve/:jobId')
  resolve(
    @Param('type') type: string,
    @Param('jobId') jobId: string,
    @Body('notes') notes: string,
  ) {
    return this.dlqService.resolveJob(type, jobId, notes);
  }
}
