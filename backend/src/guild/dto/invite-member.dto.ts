import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteMemberDto {
  @ApiProperty({
    description: 'User ID to invite to the guild',
    example: 'clx789ghi012',
  })
  @IsString()
  userId!: string;

  @ApiPropertyOptional({
    description: 'Role to assign to the invited member (e.g., MEMBER, ADMIN)',
    example: 'MEMBER',
  })
  @IsOptional()
  @IsString()
  role?: string; // GuildRole
}
