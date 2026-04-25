import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindBountyDto {
  @ApiPropertyOptional({
    description: 'Filter by bounty status',
    enum: [
      'OPEN',
      'IN_PROGRESS',
      'IN_REVIEW',
      'SUBMITTED_FOR_REVIEW',
      'COMPLETED_PENDING_CLAIM',
      'COMPLETED',
      'CANCELLED',
    ],
    example: 'OPEN',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'OPEN',
    'IN_PROGRESS',
    'IN_REVIEW',
    'SUBMITTED_FOR_REVIEW',
    'COMPLETED_PENDING_CLAIM',
    'COMPLETED',
    'CANCELLED',
  ])
  status?: string;

  @ApiPropertyOptional({
    description:
      'Filter by reward token type. Common values: "STELLAR" (native XLM), "USDC", "ETH"',
    example: 'STELLAR',
  })
  @IsOptional()
  @IsString()
  tokenType?: string;

  @ApiPropertyOptional({
    description:
      'Minimum reward amount filter. For Stellar tokens, in stroops (1 XLM = 10,000,000 stroops). Example: 100000000 = 10 XLM',
    example: 100000000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minReward?: number;

  @ApiPropertyOptional({
    description: 'Filter by guild ID to show only bounties from a specific guild',
    example: 'guild_ck1234567890',
  })
  @IsOptional()
  @IsString()
  guildId?: string;
}
