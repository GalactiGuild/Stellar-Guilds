import { Test, TestingModule } from '@nestjs/testing';
import { PayoutBatchService, BatchStatus } from './payout-batch.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PayoutBatchService', () => {
    let service: PayoutBatchService;
    let prisma: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayoutBatchService,
                {
                    provide: PrismaService,
                    useValue: {
                        payoutBatch: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PayoutBatchService>(PayoutBatchService);
        prisma = module.get(PrismaService);
    });

    it('should update status and record failure reason when FAILED', async () => {
        const batchId = 'batch-1';
        prisma.payoutBatch.findUnique.mockResolvedValue({ id: batchId, status: BatchStatus.PENDING });
        prisma.payoutBatch.update.mockImplementation(({ data }: any) => Promise.resolve({ id: batchId, ...data }));

        const res = await service.updateBatchStatus(batchId, BatchStatus.FAILED, 'Network error');

        expect(prisma.payoutBatch.update).toHaveBeenCalledWith({
            where: { id: batchId },
            data: { status: BatchStatus.FAILED, failureReason: 'Network error' },
        });
        expect(res.status).toBe(BatchStatus.FAILED);
    });

    it('should prevent transition from SUCCESS to PROCESSING', async () => {
        const batchId = 'batch-1';
        prisma.payoutBatch.findUnique.mockResolvedValue({ id: batchId, status: BatchStatus.SUCCESS });

        await expect(
            service.updateBatchStatus(batchId, BatchStatus.PROCESSING)
        ).rejects.toThrow(BadRequestException);

        expect(prisma.payoutBatch.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if batch does not exist', async () => {
        prisma.payoutBatch.findUnique.mockResolvedValue(null);
        await expect(service.updateBatchStatus('gone', BatchStatus.SUCCESS)).rejects.toThrow(NotFoundException);
    });
});
