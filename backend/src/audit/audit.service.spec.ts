import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: {
    auditLog: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordAction', () => {
    it('should create an audit log entry with correct data', async () => {
      const mockEntry = {
        id: 'audit-1',
        userId: 'user-1',
        action: 'BOUNTY_DELETE',
        entityType: 'BOUNTY',
        entityId: 'bounty-1',
        metadata: {},
        createdAt: new Date(),
      };

      prisma.auditLog.create.mockResolvedValue(mockEntry);

      const result = await service.recordAction({
        userId: 'user-1',
        action: 'BOUNTY_DELETE',
        entityType: 'BOUNTY',
        entityId: 'bounty-1',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          action: 'BOUNTY_DELETE',
          entityType: 'BOUNTY',
          entityId: 'bounty-1',
          metadata: {},
        },
      });
      expect(result).toEqual(mockEntry);
    });

    it('should handle DB errors gracefully without throwing', async () => {
      prisma.auditLog.create.mockRejectedValue(new Error('DB connection lost'));

      const result = await service.recordAction({
        userId: 'user-1',
        action: 'TEST_ACTION',
      });

      // Should return null instead of throwing
      expect(result).toBeNull();
    });

    it('should default metadata to empty object', async () => {
      prisma.auditLog.create.mockResolvedValue({ id: '1' });

      await service.recordAction({
        userId: 'user-1',
        action: 'USER_LOGIN',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: {},
          }),
        }),
      );
    });
  });

  describe('getLogs', () => {
    it('should return paginated audit logs', async () => {
      const mockLogs = [
        { id: '1', action: 'BOUNTY_DELETE' },
        { id: '2', action: 'USER_BAN' },
      ];

      prisma.auditLog.findMany.mockResolvedValue(mockLogs);
      prisma.auditLog.count.mockResolvedValue(2);

      const result = await service.getLogs({ page: 0, size: 10 });

      expect(result.items).toEqual(mockLogs);
      expect(result.total).toBe(2);
      expect(result.page).toBe(0);
      expect(result.size).toBe(10);
    });
  });
});
