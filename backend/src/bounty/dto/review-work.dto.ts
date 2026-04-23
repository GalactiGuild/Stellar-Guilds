import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewWorkDto {
  @IsBoolean()
  approve!: boolean;

  @IsString()
  @IsOptional()
  feedback?: string;
}
