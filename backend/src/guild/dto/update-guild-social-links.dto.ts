import { IsObject, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GuildSocialLinksDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  website?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  twitter?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  discord?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  github?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  telegram?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  discordServerId?: string;
}

export class UpdateGuildSocialLinksDto {
  @IsObject()
  @ValidateNested()
  @Type(() => GuildSocialLinksDto)
  socialLinks!: GuildSocialLinksDto;
}
