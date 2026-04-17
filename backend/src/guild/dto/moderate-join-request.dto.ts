import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class ModerateJoinRequestDto {
  @IsString()
  @IsIn(['APPROVE', 'REJECT'])
  action!: 'APPROVE' | 'REJECT';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewMessage?: string;
}
