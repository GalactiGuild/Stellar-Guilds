import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  IsISO8601,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBountyDto {
  @ApiPropertyOptional({
    description: 'Updated title of the bounty (max 200 characters)',
    example: 'Updated: Build a Stellar payment integration v2',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the bounty requirements and deliverables',
    example: 'Updated requirements for the Stellar payment integration...',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated reward amount in the specified token',
    example: 750,
  })
  @IsOptional()
  @IsNumber()
  rewardAmount?: number;

  @ApiPropertyOptional({
    description: 'Updated token type for the reward (e.g., XLM, USDC)',
    example: 'USDC',
  })
  @IsOptional()
  @IsString()
  rewardToken?: string;

  @ApiPropertyOptional({
    description: 'Updated deadline for bounty completion in ISO 8601 format',
    example: '2026-08-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
