import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsObject,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateGuildDto {
  @ApiProperty({
    description: 'Name of the guild (1-100 characters)',
    example: 'Stellar Builders Guild',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({
    description:
      'URL-friendly identifier for the guild (lowercase letters, numbers, and hyphens only). Auto-generated from name if not provided.',
    example: 'stellar-builders-guild',
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
    description: 'Guild description explaining its purpose and community',
    example: 'A guild for developers building on the Stellar network...',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Guild configuration settings object',
    example: { visibility: 'public', allowJoinRequests: true },
  })
  @IsOptional()
  @IsObject()
  settings?: any;
}
