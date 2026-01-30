import { IsString, IsOptional } from 'class-validator';

export class ApproveInviteDto {
  @IsOptional()
  @IsString()
  token?: string;
}
