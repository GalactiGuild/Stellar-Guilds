import { Test, TestingModule } from '@nestjs/testing';
import { TokenBlacklistService } from './token-blacklist.service';
import { RedisService } from '../../common/services/redis.service';
import { JwtService } from '@nestjs/jwt';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let redisService: RedisService;
  let jwtService: JwtService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockJwtService = {
    decode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    redisService = module.get<RedisService>(RedisService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should add token to blacklist with correct TTL', async () => {
      const token = 'test.jwt.token';
      const futureTime = Math.floor(Date.now() / 1000) + 900; // 15 minutes from now

      mockJwtService.decode.mockReturnValue({ exp: futureTime });

      await service.add(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('blacklist:token:'),
        'blacklisted',
        expect.any(Number),
      );
    });

    it('should not blacklist expired tokens', async () => {
      const token = 'test.jwt.token';
      const pastTime = Math.floor(Date.now() / 1000) - 100; // 100 seconds ago

      mockJwtService.decode.mockReturnValue({ exp: pastTime });

      await service.add(token);

      expect(redisService.set).not.toHaveBeenCalled();
    });

    it('should handle tokens without expiration', async () => {
      const token = 'test.jwt.token';

      mockJwtService.decode.mockReturnValue({ sub: '123' });

      await service.add(token);

      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('isBlacklisted', () => {
    it('should return true if token is blacklisted', async () => {
      const token = 'test.jwt.token';

      mockRedisService.get.mockResolvedValue('blacklisted');

      const result = await service.isBlacklisted(token);

      expect(result).toBe(true);
      expect(redisService.get).toHaveBeenCalledWith(
        expect.stringContaining('blacklist:token:'),
      );
    });

    it('should return false if token is not blacklisted', async () => {
      const token = 'test.jwt.token';

      mockRedisService.get.mockResolvedValue(null);

      const result = await service.isBlacklisted(token);

      expect(result).toBe(false);
    });

    it('should return false if Redis is unavailable', async () => {
      const token = 'test.jwt.token';

      mockRedisService.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.isBlacklisted(token);

      expect(result).toBe(false);
    });
  });
});
