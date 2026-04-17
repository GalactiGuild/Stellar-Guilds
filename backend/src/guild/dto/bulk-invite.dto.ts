import { ApiProperty } from '@nestjs/swagger';

export class BulkInviteResultDto {
  @ApiProperty({ description: 'Number of invitations successfully created' })
  invited!: number;

  @ApiProperty({ description: 'Number of addresses skipped due to errors' })
  skipped!: number;

  @ApiProperty({ description: 'Summary message', example: 'Invited 45 users, 5 invalid addresses skipped' })
  message!: string;

  @ApiProperty({
    description: 'Details of each row outcome',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        identifier: { type: 'string' },
        status: { type: 'string', enum: ['invited', 'skipped'] },
        reason: { type: 'string', nullable: true },
      },
    },
  })
  details!: { identifier: string; status: 'invited' | 'skipped'; reason?: string }[];
}
