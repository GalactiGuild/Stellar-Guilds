import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address for account registration',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Unique username (minimum 3 characters)',
    example: 'stellarbuilder',
  })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'StrongPassword123',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Gabriel',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Lovelace',
  })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({
    description:
      'Optional Ethereum wallet address for blockchain interactions (format: 0x followed by 40 hex characters)',
    example: '0x1111111111111111111111111111111111111111',
  })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'walletAddress must be a valid Ethereum address',
  })
  walletAddress?: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Registered email address for authentication',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPassword123',
  })
  @IsString()
  password!: string;
}

export class WalletAuthDto {
  @ApiProperty({
    description:
      'Ethereum wallet address used for signature-based authentication (format: 0x followed by 40 hex characters)',
    example: '0x1111111111111111111111111111111111111111',
  })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'walletAddress must be a valid Ethereum address',
  })
  walletAddress!: string;

  @ApiProperty({
    description: 'Message that was signed by the wallet for verification',
    example: 'Sign in to Stellar Guilds - Nonce: 12345',
  })
  @IsString()
  message!: string;

  @ApiProperty({
    description: 'Cryptographic signature of the message from the wallet',
    example: '0x...',
  })
  @IsString()
  signature!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token for obtaining a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Authenticated user information',
    example: {
      id: 'clx123abc456',
      email: 'user@example.com',
      username: 'stellarbuilder',
      walletAddress: '0x1111111111111111111111111111111111111111',
    },
  })
  user!: {
    id: string;
    email: string;
    username: string;
    walletAddress?: string;
  };
}
