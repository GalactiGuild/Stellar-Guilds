import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ReputationService } from './reputation/reputation.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly reputationService: ReputationService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit: string) {
    const numLimit = limit ? parseInt(limit, 10) : 50;
    return this.reputationService.getLeaderboard(numLimit);
  }
}
