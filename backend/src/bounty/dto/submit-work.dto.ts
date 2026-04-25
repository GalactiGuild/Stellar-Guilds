import {
  IsString,
  IsUrl,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for submitting a single work item (PR/commit) for a bounty
 */
export class WorkSubmissionDto {
  @ApiProperty({
    description:
      'URL to the Pull Request or commit on GitHub/GitLab (must be a valid URL with protocol)',
    example: 'https://github.com/org/repo/pull/123',
    maxLength: 2048,
  })
  @IsNotEmpty({ message: 'PR URL is required' })
  @IsUrl(
    { require_protocol: true, require_tld: true },
    { message: 'Invalid PR/commit URL format' },
  )
  @MaxLength(2048, { message: 'PR URL must not exceed 2048 characters' })
  prUrl!: string;

  @ApiProperty({
    description:
      'Description of the work completed, including what was implemented and how to test it (max 5000 characters)',
    example:
      'Implemented JWT authentication with refresh tokens. Added unit tests for all endpoints. To test: run npm test',
    maxLength: 5000,
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
    description:
      'Array of attachment URLs (e.g., screenshots, demo videos, documentation)',
    example: [
      'https://example.com/screenshot.png',
      'https://example.com/demo.mp4',
    ],
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
    description:
      'Additional comments or notes for the reviewer (max 1000 characters)',
    example: 'Please review the authentication flow and test coverage',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Additional comments must not exceed 1000 characters',
  })
  additionalComments?: string;
}
