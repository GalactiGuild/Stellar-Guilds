import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewWorkDto {
  @ApiProperty({
    description: 'Whether to approve (true) or reject (false) the submitted work',
    example: true,
  })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({
    description: 'Feedback or comments about the submitted work',
    example: 'Great work! The implementation is clean and well-tested.',
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
