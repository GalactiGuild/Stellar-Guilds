import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveInviteDto {
  @ApiPropertyOptional({
    description: 'Invitation token for guild membership approval',
    example: 'inv_abc123def456',
  })
  @IsOptional()
  @IsString()
  token?: string;
}
