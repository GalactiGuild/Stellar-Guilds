import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyBountyDto {
  @ApiPropertyOptional({
    description:
      'Application message explaining why you are qualified for this bounty (max 5000 characters)',
    example:
      'I have 5 years of experience with Node.js and have built similar authentication systems...',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;

  @ApiPropertyOptional({
    description:
      'Array of attachment URLs (e.g., GitHub repos, portfolios, previous work samples)',
    example: [
      'https://github.com/user/portfolio',
      'https://user-website.com/projects',
    ],
  })
  @IsOptional()
  attachments?: any;
}
