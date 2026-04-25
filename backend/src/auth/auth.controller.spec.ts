import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiKeyService } from './services/api-key.service';
import { RegisterDto, LoginDto, WalletAuthDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
    },
  };

  const mockUser = {
    id: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    bio: null,
    avatarUrl: null,
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
    refreshToken: null,
    role: 'USER',
    isActive: true,
    lastLoginAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            walletAuth: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
            getCurrentUser: jest.fn(),
          },
        },
        {
          provide: ApiKeyService,
          useValue: {
            create: jest.fn(),
            validate: jest.fn(),
            revoke: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('walletAuth', () => {
    it('should authenticate with wallet signature and return tokens', async () => {
      const walletAuthDto: WalletAuthDto = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e2f0',
        message: 'Sign this message',
        signature: '0x...',
      };

      jest.spyOn(authService, 'walletAuth').mockResolvedValue(mockAuthResponse);

      const result = await controller.walletAuth(walletAuthDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.walletAuth).toHaveBeenCalledWith(walletAuthDto);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      jest
        .spyOn(authService, 'refreshToken')
        .mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const request = { user: { userId: '123' } };
      const authorization = 'Bearer test-token-123';

      jest
        .spyOn(authService, 'logout')
        .mockResolvedValue({ message: 'Logged out successfully' });

      const result = await controller.logout(request, authorization);

      expect(result.message).toEqual('Logged out successfully');
      expect(authService.logout).toHaveBeenCalledWith('123', 'test-token-123');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      const request = { user: { userId: '123' } };

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(request);

      expect(result).toEqual(mockUser);
      expect(authService.getCurrentUser).toHaveBeenCalledWith('123');
    });
  });
});
