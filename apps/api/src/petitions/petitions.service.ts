import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PetitionStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ClassificationService } from '../classification/classification.service';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { UpdatePetitionDto } from './dto/update-petition.dto';
import { PetitionQueryDto } from './dto/petition-query.dto';
import { CreatePetitionUpdateDto } from './dto/create-petition-update.dto';
import { buildPaginationQuery, buildPaginationMeta, PETITION_STATUS, PUBLIC_PETITION_STATUSES } from '@change/shared';

@Injectable()
export class PetitionsService {
  constructor(
    private prisma: PrismaService,
    private classificationService: ClassificationService,
  ) {}

  async create(dto: CreatePetitionDto, authorId: string) {
    const petition = await this.prisma.petition.create({
      data: {
        authorId,
        title: dto.title,
        content: dto.content,
        summary: dto.summary ?? null,
        regionCode: dto.regionCode ?? null,
        decisionMakerNameRaw: dto.decisionMakerNameRaw ?? null,
        status: PETITION_STATUS.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    this.classificationService
      .classifyAndSave(petition.id, petition.title, petition.content)
      .catch((err: unknown) => {
        console.error('[classification] failed for petition', petition.id, err);
      });

    return {
      id: petition.id,
      title: petition.title,
      content: petition.content,
      status: petition.status,
      authorId: petition.authorId,
      primaryCategoryCode: petition.primaryCategoryCode,
      createdAt: petition.createdAt,
    };
  }

  async findAll(query: PetitionQueryDto) {
    const { page = 1, pageSize = 20, categoryCode, regionCode, status, sort } = query;
    const { skip, take } = buildPaginationQuery(page, pageSize);

    const where: Prisma.PetitionWhereInput = {
      deletedAt: null,
      ...(status
        ? { status: status as PetitionStatus }
        : { status: { in: PUBLIC_PETITION_STATUSES as PetitionStatus[] } }),
      ...(categoryCode
        ? {
            OR: [
              { primaryCategoryCode: categoryCode },
              { primaryCategoryCode: { startsWith: `${categoryCode}_` } },
            ],
          }
        : {}),
      ...(regionCode ? { regionCode } : {}),
    };

    const [petitions, totalItems] = await Promise.all([
      this.prisma.petition.findMany({
        where,
        orderBy: sort === 'popular' ? { signatureCountCached: 'desc' } : { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          title: true,
          status: true,
          primaryCategoryCode: true,
          regionCode: true,
          signatureCountCached: true,
          donationAmountCached: true,
          createdAt: true,
          _count: { select: { comments: { where: { deletedAt: null } } } },
        },
      }),
      this.prisma.petition.count({ where }),
    ]);

    return {
      items: petitions.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        primaryCategoryCode: p.primaryCategoryCode,
        regionCode: p.regionCode,
        signatureCount: p.signatureCountCached,
        donationAmount: p.donationAmountCached,
        commentCount: p._count.comments,
        createdAt: p.createdAt,
      })),
      meta: buildPaginationMeta(totalItems, page, pageSize),
    };
  }

  async findOne(id: string) {
    const petition = await this.prisma.petition.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, displayName: true } },
        decisionMaker: { select: { id: true, name: true } },
        categoryMappings: {
          include: { category: { select: { code: true, label: true } } },
        },
      },
    });

    if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');

    return {
      id: petition.id,
      title: petition.title,
      content: petition.content,
      summary: petition.summary,
      status: petition.status,
      regionCode: petition.regionCode,
      authorId: petition.authorId,
      author: petition.author,
      decisionMaker: petition.decisionMaker,
      categories: petition.categoryMappings.map((m) => ({
        code: m.category.code,
        label: m.category.label,
        isPrimary: m.isPrimary,
      })),
      signatureCount: petition.signatureCountCached,
      donationAmount: petition.donationAmountCached,
      targetSignatureCount: petition.targetSignatureCount,
      createdAt: petition.createdAt,
      publishedAt: petition.publishedAt,
    };
  }

  async update(id: string, dto: UpdatePetitionDto, userId: string) {
    const petition = await this.prisma.petition.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, authorId: true },
    });

    if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');
    if (petition.authorId !== userId) throw new ForbiddenException('수정 권한이 없습니다.');

    const updated = await this.prisma.petition.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.regionCode !== undefined && { regionCode: dto.regionCode }),
        ...(dto.decisionMakerNameRaw !== undefined && { decisionMakerNameRaw: dto.decisionMakerNameRaw }),
        status: PETITION_STATUS.REVIEW,
      },
      select: { id: true, title: true, status: true },
    });

    return updated;
  }

  async findMine(userId: string) {
    const petitions = await this.prisma.petition.findMany({
      where: { authorId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        signatureCountCached: true,
        createdAt: true,
      },
    });

    return {
      items: petitions.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        signatureCount: p.signatureCountCached,
        createdAt: p.createdAt,
      })),
    };
  }

  async getUpdates(petitionId: string) {
    const petition = await this.prisma.petition.findUnique({
      where: { id: petitionId, deletedAt: null },
      select: { id: true },
    });
    if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');

    const updates = await this.prisma.petitionUpdate.findMany({
      where: { petitionId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, displayName: true } } },
    });
    return updates;
  }

  async deletePetition(id: string) {
    const petition = await this.prisma.petition.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');
    await this.prisma.petition.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id };
  }

  async createUpdate(petitionId: string, dto: CreatePetitionUpdateDto, userId: string) {
    const petition = await this.prisma.petition.findUnique({
      where: { id: petitionId, deletedAt: null },
      select: { id: true, authorId: true },
    });
    if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');
    if (petition.authorId !== userId) throw new ForbiddenException('작성자만 업데이트를 작성할 수 있습니다.');

    return this.prisma.petitionUpdate.create({
      data: {
        petitionId,
        authorId: userId,
        title: dto.title ?? null,
        content: dto.content,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });
  }
}
