import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsObject,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateGuildDto {
  @ApiPropertyOptional({
    description: 'Updated name of the guild (1-100 characters)',
    example: 'Stellar Builders Guild v2',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Updated URL-friendly identifier (lowercase letters, numbers, and hyphens only)',
    example: 'stellar-builders-guild-v2',
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => value?.toLowerCase().trim())
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Updated guild description',
    example: 'An improved guild for developers building on Stellar...',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated guild configuration settings',
    example: { visibility: 'private', allowJoinRequests: false },
  })
  @IsOptional()
  @IsObject()
  settings?: any;
}
