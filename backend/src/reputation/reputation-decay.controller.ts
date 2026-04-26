import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReputationDecayService } from './reputation-decay.service';

@ApiTags('reputation-decay')
@Controller('reputation-decay')
export class ReputationDecayController {
  constructor(private readonly reputationDecayService: ReputationDecayService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get reputation decay statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns statistics about inactive users and potential reputation decay',
    schema: {
      type: 'object',
      properties: {
        totalInactiveUsers: {
          type: 'number',
          description: 'Total number of users inactive for 180+ days',
        },
        usersWithReputation: {
          type: 'number',
          description: 'Number of inactive users with reputation points',
        },
        averageReputation: {
          type: 'number',
          description: 'Average reputation among inactive users with reputation',
        },
      },
    },
  })
  async getStatistics() {
    return this.reputationDecayService.getDecayStatistics();
  }

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Manually trigger reputation decay process',
    description: 'This endpoint is primarily for testing and manual execution. The process normally runs automatically on the 1st of every month.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reputation decay process completed successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error occurred during reputation decay process',
  })
  async triggerDecay() {
    await this.reputationDecayService.handleReputationDecay();
    return { message: 'Reputation decay process completed successfully' };
  }
}
