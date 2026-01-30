import { IsString, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  role?: string; // GuildRole
}
