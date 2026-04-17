import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GuildDetailsDto {
  @ApiProperty({
    description: 'Unique identifier for the guild',
    example: 'clx123abc456',
  })
  id!: string;

  @ApiProperty({
    description: 'Date and time when the guild was created',
    example: '2026-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date and time when the guild was last updated',
    example: '2026-04-10T14:20:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Name of the guild',
    example: 'Stellar Builders Guild',
  })
  name!: string;

  @ApiProperty({
    description: 'URL-friendly identifier for the guild',
    example: 'stellar-builders-guild',
  })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Guild description',
    example: 'A community for Stellar developers',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to the guild avatar image',
    example: 'https://example.com/avatars/guild123.png',
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'URL to the guild banner image',
    example: 'https://example.com/banners/guild123.png',
  })
  bannerUrl?: string;

  @ApiProperty({
    description: 'User ID of the guild owner',
    example: 'clx456def789',
  })
  ownerId!: string;

  @ApiPropertyOptional({
    description: 'Guild configuration settings',
    example: { visibility: 'public', allowJoinRequests: true },
  })
  settings?: any;

  @ApiProperty({
    description: 'Number of members in the guild',
    example: 42,
  })
  memberCount!: number;

  @ApiProperty({
    description: 'Whether the guild is currently active',
    example: true,
  })
  isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Count of related entities',
    example: { memberships: 42, bounties: 15 },
  })
  _count?: {
    memberships?: number;
    bounties?: number;
  };

  @ApiPropertyOptional({
    description: 'Guild memberships/members list',
    type: 'array',
    items: { type: 'object' },
  })
  memberships?: any[];

  @ApiPropertyOptional({
    description: 'Guild owner information',
    type: 'object',
  })
  owner?: any;

  @ApiPropertyOptional({
    description: 'Bounties associated with this guild',
    type: 'array',
    items: { type: 'object' },
  })
  bounties?: any[];
}
