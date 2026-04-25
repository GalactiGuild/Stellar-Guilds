import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating user notification preferences
 */
export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    description: 'Receive email notifications for bounty updates',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  emailOnBounty?: boolean;

  @ApiPropertyOptional({
    description: 'Receive email notifications when mentioned',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  emailOnMention?: boolean;

  @ApiPropertyOptional({
    description: 'Receive weekly digest email',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean;
}

/**
 * DTO for notification preferences response
 */
export class NotificationPreferencesDto {
  emailOnBounty!: boolean;
  emailOnMention!: boolean;
  weeklyDigest!: boolean;
}
