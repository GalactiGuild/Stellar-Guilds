import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:'];

function IsSafeUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSafeUrl',
      target: (object as any).constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const lower = value.toLowerCase().trimStart();
          return !DANGEROUS_SCHEMES.some((scheme) => lower.startsWith(scheme));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains a dangerous URL scheme`;
        },
      },
    });
  };
}

export class SubmitBountyDto {
  @ApiPropertyOptional({
    description:
      'Attachment URLs (max 5). Must be valid https/http URLs. javascript:, data:, vbscript:, and file: schemes are rejected.',
    example: ['https://example.com/proof.png'],
    maxItems: 5,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'A maximum of 5 attachments are allowed' })
  @IsString({ each: true })
  @IsUrl({ require_protocol: true, require_tld: true }, { each: true })
  @IsSafeUrl({ each: true })
  attachments?: string[];
}
