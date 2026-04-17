import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyBountyDto {
  @ApiPropertyOptional({
    description: 'Application message explaining why you are a good fit for this bounty',
    example:
      'I have extensive experience with Stellar SDK and have built similar payment integrations before...',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;

  @ApiPropertyOptional({
    description: 'Optional attachments or portfolio links to support your application',
    example: ['https://github.com/username/project', 'https://portfolio.example.com'],
  })
  @IsOptional()
  attachments?: any;
}
