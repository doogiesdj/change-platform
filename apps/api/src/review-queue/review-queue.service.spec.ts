import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviewQueueService } from './review-queue.service';
import { PrismaService } from '../database/prisma.service';
import { REVIEW_STATUS, REVIEW_DECISION, PETITION_STATUS } from '@change/shared';

const mockReviewItem = {
  id: 'review-1',
  petitionId: 'petition-1',
  reviewStatus: REVIEW_STATUS.PENDING,
  assignedModeratorId: null,
  reviewedById: null,
  reviewedAt: null,
  note: null,
  createdAt: new Date(),
  petition: {
    id: 'petition-1',
    title: '테스트 청원',
    content: '내용',
    status: PETITION_STATUS.REVIEW,
    primaryCategoryCode: 'ENV',
    createdAt: new Date(),
    authorId: 'user-1',
  },
};

const buildPrismaMock = () => ({
  reviewQueue: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
});

describe('ReviewQueueService', () => {
  let service: ReviewQueueService;
  let prisma: ReturnType<typeof buildPrismaMock>;

  beforeEach(async () => {
    prisma = buildPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewQueueService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewQueueService>(ReviewQueueService);
  });

  describe('findPending', () => {
    it('queries reviewQueue with PENDING status', async () => {
      (prisma.reviewQueue.findMany as jest.Mock).mockResolvedValue([]);

      await service.findPending();

      expect(prisma.reviewQueue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reviewStatus: REVIEW_STATUS.PENDING },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when item does not exist', async () => {
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('returns review item when found', async () => {
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue(mockReviewItem);

      const result = await service.findOne('review-1');

      expect(result.id).toBe('review-1');
    });
  });

  describe('assign', () => {
    it('throws NotFoundException when item does not exist', async () => {
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.assign('nonexistent', 'mod-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when item is already processed', async () => {
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue({
        ...mockReviewItem,
        reviewStatus: REVIEW_STATUS.APPROVED,
      });

      await expect(service.assign('review-1', 'mod-1')).rejects.toThrow(BadRequestException);
    });

    it('assigns moderator when item is pending', async () => {
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue(mockReviewItem);
      (prisma.reviewQueue.update as jest.Mock).mockResolvedValue({
        ...mockReviewItem,
        assignedModeratorId: 'mod-1',
      });

      await service.assign('review-1', 'mod-1');

      expect(prisma.reviewQueue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { assignedModeratorId: 'mod-1' },
        }),
      );
    });
  });

  describe('decide', () => {
    beforeEach(() => {
      // Mock findOne (called at the end of decide)
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue(mockReviewItem);
    });

    it('throws NotFoundException when review item does not exist', async () => {
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.decide('nonexistent', REVIEW_DECISION.APPROVE, 'mod-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when item is already processed', async () => {
      (prisma.reviewQueue.findUnique as jest.Mock).mockResolvedValue({
        ...mockReviewItem,
        reviewStatus: REVIEW_STATUS.APPROVED,
      });

      await expect(
        service.decide('review-1', REVIEW_DECISION.APPROVE, 'mod-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when reclassify is requested without newCategoryCode', async () => {
      await expect(
        service.decide('review-1', REVIEW_DECISION.RECLASSIFY, 'mod-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('runs transaction on approve', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);
      // findUnique called twice: once for initial check, once for findOne at end
      (prisma.reviewQueue.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockReviewItem)
        .mockResolvedValueOnce(mockReviewItem);

      await service.decide('review-1', REVIEW_DECISION.APPROVE, 'mod-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('runs transaction on reject', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);
      (prisma.reviewQueue.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockReviewItem)
        .mockResolvedValueOnce(mockReviewItem);

      await service.decide('review-1', REVIEW_DECISION.REJECT, 'mod-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('runs transaction on reclassify with newCategoryCode', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);
      (prisma.reviewQueue.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockReviewItem)
        .mockResolvedValueOnce(mockReviewItem);

      await service.decide('review-1', REVIEW_DECISION.RECLASSIFY, 'mod-1', undefined, 'ENV');

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
