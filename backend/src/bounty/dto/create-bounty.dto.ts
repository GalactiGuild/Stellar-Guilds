import {
  IsString,
  IsOptional,
  IsNumber,
  IsDecimal,
  IsPositive,
  MaxLength,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsFutureDate } from '../decorators/future-date.decorator';

export class CreateBountyDto {
  @ApiProperty({
    description: 'Title of the bounty task (max 200 characters)',
    example: 'Implement User Authentication API',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the bounty requirements and expectations (max 5000 characters)',
    example: 'Create a RESTful API endpoint for user registration and login with JWT authentication...',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({
    description:
      'Reward amount for completing the bounty. For Stellar tokens, this is in stroops (1 XLM = 10,000,000 stroops). Example: 500000000 = 50 XLM',
    example: 500000000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  rewardAmount?: number;

  @ApiPropertyOptional({
    description:
      'Token type for the reward. Common values: "STELLAR" (native XLM), "USDC", or custom asset codes. For Stellar assets, format is "CODE:ISSUER_ADDRESS"',
    example: 'STELLAR',
    enum: ['STELLAR', 'USDC', 'ETH', 'CUSTOM'],
  })
  @IsOptional()
  @IsString()
  rewardToken?: string;

  @ApiPropertyOptional({
    description:
      'ISO 8601 deadline for bounty completion. Must be a future date in format: YYYY-MM-DDTHH:mm:ss.sssZ',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  @IsFutureDate({ message: 'Deadline must be a valid date in the future' })
  deadline?: string;

  @ApiPropertyOptional({
    description: 'Guild ID to associate this bounty with (for guild-specific bounties)',
    example: 'guild_ck1234567890',
  })
  @IsOptional()
  @IsString()
  guildId?: string;
}
