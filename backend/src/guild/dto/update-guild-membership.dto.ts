import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGuildMembershipDto {
  @ApiPropertyOptional({
    description: 'Guild-specific bio for the member',
    example: 'Lead Rust Developer for Stellar Guilds',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}