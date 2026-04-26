import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class LinkDiscordDto {
  @ApiProperty({
    description: 'Mock OAuth code from Discord (for testing purposes)',
    example: 'mock_oauth_code_12345',
  })
  @IsString()
  @Transform(trimString)
  @MinLength(1)
  @MaxLength(500)
  code!: string;
}

export class DiscordLinkResponseDto {
  @ApiProperty({ description: 'Success message' })
  message!: string;

  @ApiProperty({ description: 'Linked Discord ID', required: false })
  discordId?: string;
}

export class UnlinkDiscordResponseDto {
  @ApiProperty({ description: 'Success message' })
  message!: string;
}
