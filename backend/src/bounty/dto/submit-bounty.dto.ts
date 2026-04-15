import { IsArray, IsString, IsUrl, IsOptional, ArrayMaxSize, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'SafeUrl', async: false })
export class SafeUrlValidator implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    const lowerUrl = url.toLowerCase().trim();
    
    // Block dangerous URL schemes
    const dangerousSchemes = [
      'javascript:',
      'data:',
      'vbscript:',
      'file:',
      'ftp:',
      'mailto:',
      'tel:',
      'sms:'
    ];
    
    for (const scheme of dangerousSchemes) {
      if (lowerUrl.startsWith(scheme)) {
        return false;
      }
    }
    
    // Only allow http and https
    return lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://');
  }

  defaultMessage(args: ValidationArguments) {
    return 'URL must use http:// or https:// protocol and cannot contain dangerous schemes';
  }
}

export class SubmitBountyDto {
  @IsString()
  submissionUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 attachments allowed' })
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @Validate(SafeUrlValidator, { each: true })
  attachments?: string[];
}