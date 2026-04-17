import {
  IsString,
  IsUrl,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for submitting a single work item (PR/commit) for a bounty
 */
export class WorkSubmissionDto {
  @ApiProperty({
    description: 'URL to the pull request or commit demonstrating the completed work',
    example: 'https://github.com/username/repo/pull/42',
  })
  @IsNotEmpty({ message: 'PR URL is required' })
  @IsUrl(
    { require_protocol: true, require_tld: true },
    { message: 'Invalid PR/commit URL format' },
  )
  @MaxLength(2048, { message: 'PR URL must not exceed 2048 characters' })
  prUrl!: string;

  @ApiProperty({
    description: 'Description of the work completed in this submission',
    example: 'Implemented the Stellar payment component with test coverage...',
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description!: string;
}

/**
 * DTO for submitting completed work for a bounty
 * Supports multiple PR submissions with descriptions and optional attachments
 */
export class SubmitBountyWorkDto {
  @ApiProperty({
    description: 'Array of work submissions (PRs/commits) for this bounty',
    type: [WorkSubmissionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkSubmissionDto)
  submissions!: WorkSubmissionDto[];

  @ApiPropertyOptional({
    description: 'Optional array of attachment URLs (screenshots, documentation, etc.)',
    example: ['https://example.com/screenshot.png', 'https://docs.example.com/readme'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl(
    { require_protocol: true, require_tld: true },
    { each: true, message: 'Each attachment URL must be a valid URL' },
  )
  @MaxLength(2048, {
    each: true,
    message: 'Each attachment URL must not exceed 2048 characters',
  })
  attachmentUrls?: string[];

  @ApiPropertyOptional({
    description: 'Additional comments or notes about the submitted work',
    example: 'All tests pass and documentation has been updated.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Additional comments must not exceed 1000 characters' })
  additionalComments?: string;
}
