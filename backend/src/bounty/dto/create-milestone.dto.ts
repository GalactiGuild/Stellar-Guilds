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
    example: 'Complete frontend UI components',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of milestone requirements (max 2000 characters)',
    example: 'Implement login page, dashboard, and user profile pages',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description:
      'Reward amount for completing this milestone. For Stellar tokens, in stroops (1 XLM = 10,000,000 stroops). Example: 100000000 = 10 XLM',
    example: 100000000,
    minimum: 0,
  })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({
    description:
      'ISO 8601 due date for this milestone. Format: YYYY-MM-DDTHH:mm:ss.sssZ',
    example: '2026-06-15T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
