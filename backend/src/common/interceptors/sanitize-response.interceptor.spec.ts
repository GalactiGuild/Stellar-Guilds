import { TestingModule, Test } from '@nestjs/testing';
import { SanitizeResponseInterceptor } from './sanitize-response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('SanitizeResponseInterceptor', () => {
  let interceptor: SanitizeResponseInterceptor<any>;

  beforeEach(() => {
    interceptor = new SanitizeResponseInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should strip password field from simple object', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          id: 1,
          name: 'John',
          password: 'secret123',
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ id: 1, name: 'John' });
        expect(result).not.toHaveProperty('password');
        done();
      },
    });
  });

  it('should strip twoFactorSecret field from simple object', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          id: 1,
          email: 'john@example.com',
          twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ id: 1, email: 'john@example.com' });
        expect(result).not.toHaveProperty('twoFactorSecret');
        done();
      },
    });
  });

  it('should strip internalNote field from simple object', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          id: 1,
          name: 'Guild Name',
          internalNote: 'Admin only note',
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ id: 1, name: 'Guild Name' });
        expect(result).not.toHaveProperty('internalNote');
        done();
      },
    });
  });

  it('should strip sensitive fields case-insensitively', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          id: 1,
          Password: 'secret',
          TWOfactorSECRET: 'secret2',
          InternalNote: 'note',
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ id: 1 });
        expect(result).not.toHaveProperty('Password');
        expect(result).not.toHaveProperty('TWOfactorSECRET');
        expect(result).not.toHaveProperty('InternalNote');
        done();
      },
    });
  });

  it('should strip sensitive fields from nested objects', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          id: 1,
          user: {
            name: 'John',
            password: 'secret123',
            profile: {
              bio: 'Developer',
              twoFactorSecret: 'secret2',
            },
          },
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({
          id: 1,
          user: {
            name: 'John',
            profile: {
              bio: 'Developer',
            },
          },
        });
        expect(result.user).not.toHaveProperty('password');
        expect(result.user.profile).not.toHaveProperty('twoFactorSecret');
        done();
      },
    });
  });

  it('should strip sensitive fields from arrays of objects', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of([
          { id: 1, name: 'User 1', password: 'pass1' },
          { id: 2, name: 'User 2', password: 'pass2' },
        ]),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual([
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' },
        ]);
        expect(result[0]).not.toHaveProperty('password');
        expect(result[1]).not.toHaveProperty('password');
        done();
      },
    });
  });

  it('should handle null and undefined values', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toBeNull();
        done();
      },
    });
  });

  it('should handle primitive values', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => of('simple string'),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toBe('simple string');
        done();
      },
    });
  });

  it('should preserve non-sensitive nested data', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          id: 1,
          name: 'Guild',
          members: [
            { userId: 1, role: 'admin', password: 'secret' },
            { userId: 2, role: 'member', password: 'secret2' },
          ],
          settings: {
            theme: 'dark',
            internalNote: 'admin config',
          },
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({
          id: 1,
          name: 'Guild',
          members: [
            { userId: 1, role: 'admin' },
            { userId: 2, role: 'member' },
          ],
          settings: {
            theme: 'dark',
          },
        });
        done();
      },
    });
  });

  it('should preserve non-sensitive fields that partially match sensitive keys', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          id: 1,
          password_hash: 'abc123', // Not stripped - not exactly 'password'
          passwordHint: 'hint', // Not stripped - not exactly 'password'
          passwordUpdatedAt: 'date', // Not stripped - not exactly 'password'
          twoFactorEnabled: true, // Not stripped - not exactly 'twoFactorSecret'
          internalNotes: [], // Not stripped - not exactly 'internalNote'
          password: 'actualPassword', // Stripped - exact match
          twoFactorSecret: 'secret', // Stripped - exact match
          internalNote: 'note', // Stripped - exact match
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).not.toHaveProperty('password');
        expect(result).not.toHaveProperty('twoFactorSecret');
        expect(result).not.toHaveProperty('internalNote');
        expect(result).toHaveProperty('password_hash');
        expect(result).toHaveProperty('passwordHint');
        expect(result).toHaveProperty('passwordUpdatedAt');
        expect(result).toHaveProperty('twoFactorEnabled');
        expect(result).toHaveProperty('internalNotes');
        done();
      },
    });
  });
});
