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
    description: 'Title of the bounty (max 200 characters)',
    example: 'Build a Stellar payment integration',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the bounty requirements and deliverables',
    example:
      'Create a React component that integrates with the Stellar network for processing payments...',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({
    description:
      'Reward amount in the specified token. BPS (Basis Points): 1 basis point = 0.01%. For example, 100 BPS = 1%. Use whole token amounts here.',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  rewardAmount?: number;

  @ApiPropertyOptional({
    description:
      'Token type or asset code for the reward (e.g., XLM, USDC, or custom token address on Stellar)',
    example: 'XLM',
  })
  @IsOptional()
  @IsString()
  rewardToken?: string;

  @ApiPropertyOptional({
    description: 'Deadline for bounty completion in ISO 8601 format (must be a future date)',
    example: '2026-06-30T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  @IsFutureDate({ message: 'Deadline must be a valid date in the future' })
  deadline?: string;

  @ApiPropertyOptional({
    description:
      'Guild ID to associate this bounty with. Stellar address example: GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    example: 'clx123abc456',
  })
  @IsOptional()
  @IsString()
  guildId?: string;
}
