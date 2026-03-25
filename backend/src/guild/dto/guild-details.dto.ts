export class GuildDetailsDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  slug!: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  ownerId!: string;
  settings?: any;
  memberCount!: number;
  isActive!: boolean;

  // Counts
  _count?: {
    memberships?: number;
    bounties?: number;
  };

  // Relations included in existing implementation
  memberships?: any[];
  owner?: any;
  bounties?: any[];
}
