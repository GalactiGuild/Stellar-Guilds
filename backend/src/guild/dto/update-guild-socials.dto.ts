import { IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const URL_VALIDATION_OPTIONS = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

export class UpdateGuildSocialsDto {
  @ApiPropertyOptional({
    description: 'Guild website URL',
    example: 'https://example.org',
  })
  @IsOptional()
  @IsUrl(URL_VALIDATION_OPTIONS)
  website?: string;

  @ApiPropertyOptional({
    description: 'Guild Twitter/X profile URL',
    example: 'https://twitter.com/stellarorg',
  })
  @IsOptional()
  @IsUrl(URL_VALIDATION_OPTIONS)
  twitter?: string;

  @ApiPropertyOptional({
    description: 'Guild Discord invite or community URL',
    example: 'https://discord.gg/stellar',
  })
  @IsOptional()
  @IsUrl(URL_VALIDATION_OPTIONS)
  discord?: string;
}
