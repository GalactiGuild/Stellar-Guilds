import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindBountyDto {
  @ApiPropertyOptional({
    description: 'Filter by bounty status',
    enum: ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'SUBMITTED_FOR_REVIEW', 'COMPLETED_PENDING_CLAIM', 'COMPLETED', 'CANCELLED'],
    example: 'OPEN',
  })
  @IsOptional()
  @IsString()
  @IsIn(['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'SUBMITTED_FOR_REVIEW', 'COMPLETED_PENDING_CLAIM', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by reward token type (e.g., XLM, USDC)',
    example: 'XLM',
  })
  @IsOptional()
  @IsString()
  tokenType?: string;

  @ApiPropertyOptional({
    description: 'Filter bounties with minimum reward amount',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minReward?: number;

  @ApiPropertyOptional({
    description: 'Filter bounties by guild ID',
    example: 'clx123abc456',
  })
  @IsOptional()
  @IsString()
  guildId?: string;
}
