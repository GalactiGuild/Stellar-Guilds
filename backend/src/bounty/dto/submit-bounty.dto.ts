import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const SAFE_URL_PROTOCOLS = /^https?:\/\//i;

function isSafeUrl(url: string): boolean {
  return SAFE_URL_PROTOCOLS.test(url);
}

export class SubmitBountyDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  @ValidateIf((_, value) => Array.isArray(value) && value.every(isSafeUrl))
  attachments?: string[];
}
