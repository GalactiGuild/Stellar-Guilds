import { IsString, IsOptional, IsDateString } from 'class-validator';

export class InviteMemberDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  role?: string; // GuildRole

  @IsOptional()
  @IsDateString()
  joinedAt?: string;
}
