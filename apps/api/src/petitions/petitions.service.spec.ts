import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PetitionsService } from './petitions.service';
import { PrismaService } from '../database/prisma.service';
import { ClassificationService } from '../classification/classification.service';
import { PETITION_STATUS } from '@change/shared';

const mockPetition = {
  id: 'petition-1',
  title: '테스트 청원',
  content: '청원 내용입니다',
  summary: null,
  status: PETITION_STATUS.REVIEW,
  authorId: 'user-1',
  primaryCategoryCode: null,
  regionCode: null,
  signatureCountCached: 0,
  donationAmountCached: 0,
  targetSignatureCount: 1000,
  decisionMakerNameRaw: null,
  createdAt: new Date(),
  publishedAt: null,
  rejectedAt: null,
  deletedAt: null,
};

describe('PetitionsService', () => {
  let service: PetitionsService;
  let prisma: jest.Mocked<PrismaService>;
  let classificationService: { classifyAndSave: jest.Mock };

  beforeEach(async () => {
    classificationService = { classifyAndSave: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetitionsService,
        {
          provide: PrismaService,
          useValue: {
            petition: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ClassificationService,
          useValue: classificationService,
        },
      ],
    }).compile();

    service = module.get<PetitionsService>(PetitionsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('creates petition with REVIEW status', async () => {
      (prisma.petition.create as jest.Mock).mockResolvedValue(mockPetition);

      const result = await service.create(
        { title: '테스트 청원', content: '청원 내용입니다' },
        'user-1',
      );

      expect(prisma.petition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PETITION_STATUS.REVIEW }),
        }),
      );
      expect(result.id).toBe('petition-1');
    });

    it('triggers classification asynchronously', async () => {
      (prisma.petition.create as jest.Mock).mockResolvedValue(mockPetition);

      await service.create({ title: '청원', content: '내용' }, 'user-1');

      // classifyAndSave is called fire-and-forget; wait a tick
      await new Promise(process.nextTick);
      expect(classificationService.classifyAndSave).toHaveBeenCalledWith(
        'petition-1',
        '테스트 청원',
        '청원 내용입니다',
      );
    });

    it('does not throw when classification fails', async () => {
      (prisma.petition.create as jest.Mock).mockResolvedValue(mockPetition);
      classificationService.classifyAndSave.mockRejectedValue(new Error('classify error'));

      await expect(
        service.create({ title: '청원', content: '내용' }, 'user-1'),
      ).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('returns paginated petitions', async () => {
      (prisma.petition.findMany as jest.Mock).mockResolvedValue([mockPetition]);
      (prisma.petition.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, pageSize: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('uses createdAt desc by default', async () => {
      (prisma.petition.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.petition.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({});

      expect(prisma.petition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('uses signatureCountCached desc when sort=popular', async () => {
      (prisma.petition.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.petition.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ sort: 'popular' });

      expect(prisma.petition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { signatureCountCached: 'desc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('returns petition with related data', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue({
        ...mockPetition,
        author: { id: 'user-1', displayName: '작성자' },
        decisionMaker: null,
        categoryMappings: [],
      });

      const result = await service.findOne('petition-1');

      expect(result.id).toBe('petition-1');
      expect(result.author).toEqual({ id: 'user-1', displayName: '작성자' });
    });

    it('throws NotFoundException when petition does not exist', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when petition does not exist', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent', { title: 'new' }, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when user is not the author', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue({
        id: 'petition-1',
        authorId: 'other-user',
      });

      await expect(service.update('petition-1', { title: 'new' }, 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('updates petition when user is the author', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue({
        id: 'petition-1',
        authorId: 'user-1',
      });
      (prisma.petition.update as jest.Mock).mockResolvedValue({
        id: 'petition-1',
        title: 'updated',
        status: PETITION_STATUS.REVIEW,
      });

      const result = await service.update('petition-1', { title: 'updated' }, 'user-1');

      expect(result.title).toBe('updated');
    });
  });
});
