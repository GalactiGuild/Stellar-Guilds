import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateJoinRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
