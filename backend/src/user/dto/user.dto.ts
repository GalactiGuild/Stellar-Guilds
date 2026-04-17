import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  Matches,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimAndLowercase = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @Transform(trimAndLowercase)
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Unique username', example: 'stellarbuilder' })
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @ApiProperty({ description: 'User password', example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ description: 'User first name', example: 'Ada' })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ description: 'User last name', example: 'Lovelace' })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Optional wallet address',
    example: '0x1111111111111111111111111111111111111111',
  })
  @Transform(trimString)
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'walletAddress must be a valid Ethereum address',
  })
  walletAddress?: string;
}

// Get user profile (public)
export class UserProfileDto {
  @ApiProperty({ description: 'User ID' })
  id!: string;

  @ApiProperty({ description: 'Username' })
  username!: string;

  @ApiProperty({ description: 'First name' })
  firstName!: string;

  @ApiProperty({ description: 'Last name' })
  lastName!: string;

  @ApiPropertyOptional({ description: 'User bio' })
  bio?: string;

  @ApiPropertyOptional({ description: 'User location' })
  location?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Profile bio' })
  profileBio?: string;

  @ApiPropertyOptional({ description: 'Profile URL' })
  profileUrl?: string;

  @ApiPropertyOptional({ description: 'Discord handle' })
  discordHandle?: string;

  @ApiPropertyOptional({ description: 'Twitter handle' })
  twitterHandle?: string;

  @ApiPropertyOptional({ description: 'GitHub handle' })
  githubHandle?: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role!: UserRole;
}

// Update user profile
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated first name',
    example: 'Gabriel',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Updated last name',
    example: 'Lovelace',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User biography or about section',
    example: 'Full-stack developer passionate about blockchain technology',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'San Francisco, CA',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    description: 'Extended profile biography',
    example: 'Started coding at age 12...',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  profileBio?: string;

  @ApiPropertyOptional({
    description: 'Personal or portfolio URL (must include protocol)',
    example: 'https://myportfolio.example.com',
    maxLength: 2048,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsUrl(
    { require_protocol: true },
    { message: 'profileUrl must be a valid URL with protocol' },
  )
  @MaxLength(2048)
  profileUrl?: string;

  @ApiPropertyOptional({
    description: 'Discord username/handle',
    example: 'stellarbuilder#1234',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  discordHandle?: string;

  @ApiPropertyOptional({
    description: 'Twitter/X handle',
    example: '@stellarbuilder',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  twitterHandle?: string;

  @ApiPropertyOptional({
    description: 'GitHub username',
    example: 'stellarbuilder',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  githubHandle?: string;
}

export class UpdateUserProfileDto extends UpdateUserDto {}

// Change password
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'OldPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewStrongPassword456',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({
    description: 'Confirmation of the new password (must match newPassword)',
    example: 'NewStrongPassword456',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}

// Assign role to user
export class AssignRoleDto {
  @ApiProperty({
    description: 'Role to assign to the user',
    enum: UserRole,
    example: UserRole.MODERATOR,
  })
  @IsEnum(UserRole)
  role!: UserRole;
}

// Search and filter users
export class SearchUserDto {
  @ApiPropertyOptional({
    description: 'Search query to filter by username, email, firstName, or lastName',
    example: 'gabriel',
  })
  @IsOptional()
  @IsString()
  query?: string; // Search by username, email, firstName, lastName

  @ApiPropertyOptional({
    description: 'Filter users by role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by active/inactive status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Number of records to skip (for pagination)',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({
    description: 'Number of records to take (for pagination, max 100)',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  take?: number;
}

// Paginated user response
export class PaginatedUsersDto {
  @ApiProperty({
    description: 'Array of user profiles',
    type: [UserProfileDto],
  })
  data!: UserProfileDto[];

  @ApiProperty({
    description: 'Total number of matching records',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Number of records skipped',
    example: 0,
  })
  skip!: number;

  @ApiProperty({
    description: 'Number of records returned',
    example: 20,
  })
  take!: number;
}

// Avatar upload response
export class AvatarUploadResponseDto {
  @ApiProperty({
    description: 'URL of the uploaded avatar image',
    example: 'https://cdn.example.com/avatars/user123.png',
  })
  avatarUrl!: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Avatar uploaded successfully',
  })
  message!: string;
}

// Role and Permission DTOs
export class PermissionDto {
  @ApiProperty({
    description: 'Unique permission identifier',
    example: 'clx123abc456',
  })
  id!: string;

  @ApiProperty({
    description: 'Permission name',
    example: 'MANAGE_BOUNTIES',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows creating and managing bounties',
  })
  description?: string;
}

export class RoleDto {
  @ApiProperty({
    description: 'Unique role identifier',
    example: 'clx789def012',
  })
  id!: string;

  @ApiProperty({
    description: 'Role name',
    example: 'ADMIN',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Administrator with full access',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Permissions assigned to this role',
    type: [PermissionDto],
  })
  permissions?: PermissionDto[];
}

// User details (including sensitive info, admin only)
export class UserDetailsDto extends UserProfileDto {
  @ApiProperty({
    description: 'User email address (admin only)',
    example: 'user@example.com',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'Ethereum wallet address',
    example: '0x1111111111111111111111111111111111111111',
  })
  walletAddress?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2026-04-15T10:30:00.000Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-04-15T14:20:00.000Z',
  })
  updatedAt!: Date;
}
