import {
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMilestoneDto {
  @ApiProperty({
    description: 'Title of the milestone (max 200 characters)',
    example: 'Complete API integration',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of what needs to be delivered for this milestone',
    example: 'Implement and test all REST API endpoints for payment processing...',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Payment amount allocated to this milestone (in reward tokens)',
    example: 250,
  })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Due date for completing this milestone in ISO 8601 format',
    example: '2026-05-15T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
