import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Reflector, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { MaintenanceGuard, SKIP_MAINTENANCE_KEY } from './maintenance.guard';
import { UserRole } from '../../user/dto/user.dto';

describe('MaintenanceGuard', () => {
  let guard: MaintenanceGuard;
  let configServiceMock: { get: jest.Mock };
  let reflectorMock: { getAllAndOverride: jest.Mock };

  const createMockContext = (
    method: string = 'POST',
    user?: any,
    ip: string = '127.0.0.1',
    headers: Record<string, string> = {},
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          url: '/test',
          ip,
          headers,
          user,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn(),
    };

    reflectorMock = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };

    guard = new MaintenanceGuard(
      reflectorMock as any,
      configServiceMock as any,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('when maintenance mode is disabled', () => {
    beforeEach(() => {
      configServiceMock.get.mockReturnValue('false');
    });

    it('should allow POST requests', () => {
      const context = createMockContext('POST');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow PUT requests', () => {
      const context = createMockContext('PUT');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow DELETE requests', () => {
      const context = createMockContext('DELETE');
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('when maintenance mode is enabled', () => {
    beforeEach(() => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        return defaultValue;
      });
    });

    it('should allow GET requests', () => {
      const context = createMockContext('GET');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block POST requests with 503', () => {
      const context = createMockContext('POST');
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });

    it('should block PUT requests with 503', () => {
      const context = createMockContext('PUT');
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });

    it('should block DELETE requests with 503', () => {
      const context = createMockContext('DELETE');
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });

    it('should block PATCH requests with 503', () => {
      const context = createMockContext('PATCH');
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });

    it('should allow ADMIN users', () => {
      const context = createMockContext('POST', { id: '1', role: UserRole.ADMIN });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow OWNER users', () => {
      const context = createMockContext('POST', { id: '1', role: UserRole.OWNER });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block regular USER role', () => {
      const context = createMockContext('POST', { id: '1', role: UserRole.USER });
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });

    it('should block MODERATOR role', () => {
      const context = createMockContext('POST', { id: '1', role: UserRole.MODERATOR });
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });

    it('should allow bypass with correct key', () => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        if (key === 'MAINTENANCE_BYPASS_KEY') return 'secret-key';
        return defaultValue;
      });

      const context = createMockContext('POST', undefined, '127.0.0.1', {
        'x-maintenance-bypass-key': 'secret-key',
      });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block with incorrect bypass key', () => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        if (key === 'MAINTENANCE_BYPASS_KEY') return 'secret-key';
        return defaultValue;
      });

      const context = createMockContext('POST', undefined, '127.0.0.1', {
        'x-maintenance-bypass-key': 'wrong-key',
      });
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });

    it('should allow requests from allowed IPs', () => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        if (key === 'MAINTENANCE_ALLOWED_IPS') return '192.168.1.1, 10.0.0.1';
        return defaultValue;
      });

      const context = createMockContext('POST', undefined, '192.168.1.1');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow requests from second allowed IP', () => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        if (key === 'MAINTENANCE_ALLOWED_IPS') return '192.168.1.1, 10.0.0.1';
        return defaultValue;
      });

      const context = createMockContext('POST', undefined, '10.0.0.1');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block requests from non-allowed IPs', () => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        if (key === 'MAINTENANCE_ALLOWED_IPS') return '192.168.1.1, 10.0.0.1';
        return defaultValue;
      });

      const context = createMockContext('POST', undefined, '127.0.0.1');
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });
  });

  describe('SkipMaintenance decorator', () => {
    beforeEach(() => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        return defaultValue;
      });
    });

    it('should allow requests when SkipMaintenance is set', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(true);

      const context = createMockContext('POST');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should still block when SkipMaintenance is false', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);

      const context = createMockContext('POST');
      expect(() => guard.canActivate(context)).toThrow(ServiceUnavailableException);
    });
  });

  describe('error response format', () => {
    beforeEach(() => {
      configServiceMock.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'API_MAINTENANCE_MODE') return 'true';
        if (key === 'MAINTENANCE_MESSAGE') return 'Custom maintenance message';
        if (key === 'MAINTENANCE_ESTIMATED_DOWNTIME') return '2 hours';
        if (key === 'MAINTENANCE_RETRY_AFTER') return '7200';
        return defaultValue;
      });
    });

    it('should include custom message and estimated downtime in error', () => {
      const context = createMockContext('POST');

      try {
        guard.canActivate(context);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        const response = error.getResponse();
        expect(response.message).toBe('Custom maintenance message');
        expect(response.estimatedDowntime).toBe('2 hours');
        expect(response.statusCode).toBe(503);
        expect(response.error).toBe('Service Unavailable');
      }
    });
  });
});
