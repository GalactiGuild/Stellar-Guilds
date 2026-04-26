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
    description: 'Updated title of the bounty task (max 200 characters)',
    example: 'Implement User Authentication API v2',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description:
      'Updated detailed description of the bounty (max 5000 characters)',
    example: 'Updated requirements: Add OAuth2 support...',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description:
      'Updated reward amount. For Stellar tokens, this is in stroops (1 XLM = 10,000,000 stroops)',
    example: 750000000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  rewardAmount?: number;

  @ApiPropertyOptional({
    description:
      'Updated token type for the reward. Common values: "STELLAR", "USDC", "ETH", or "CODE:ISSUER_ADDRESS" for custom Stellar assets',
    example: 'USDC',
  })
  @IsOptional()
  @IsString()
  rewardToken?: string;

  @ApiPropertyOptional({
    description:
      'Updated ISO 8601 deadline for bounty completion. Must be a future date',
    example: '2027-06-30T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
