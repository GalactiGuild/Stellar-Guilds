import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

function createMockContext(user?: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow when no roles required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(await guard.canActivate(createMockContext({ userId: '1' }))).toBe(true);
  });

  it('should throw when no user authenticated', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    await expect(guard.canActivate(createMockContext(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow when user has required role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(
      await guard.canActivate(createMockContext({ userId: '1', roles: ['ADMIN'] })),
    ).toBe(true);
  });

  it('should deny when user lacks required role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    await expect(
      guard.canActivate(createMockContext({ userId: '1', roles: ['USER'] })),
    ).rejects.toThrow(ForbiddenException);
  });
});
