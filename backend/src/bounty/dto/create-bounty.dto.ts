import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateBountyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  rewardAmount: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  requirements?: string;
}