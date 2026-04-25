import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewWorkDto {
  @ApiProperty({
    description:
      'Whether to approve or reject the submitted work. true = approve, false = reject',
    example: true,
  })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({
    description:
      'Feedback for the submitter. Required when approve is false, explaining why the work was rejected',
    example:
      'Great work! The implementation looks solid. Just add more comments to the authentication middleware.',
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
