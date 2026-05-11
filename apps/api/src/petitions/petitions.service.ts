import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ClassificationService } from '../classification/classification.service';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { PetitionQueryDto } from './dto/petition-query.dto';
import { buildPaginationQuery, buildPaginationMeta } from '@change/shared';

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
        status: 'review',
      },
    });

    await this.classificationService.classifyAndSave(petition.id, dto.title, dto.content);

    return petition;
  }

  async findAll(query: PetitionQueryDto) {
    const { page = 1, limit = 20, categoryCode, regionCode, status, sort } = query;
    const { skip, take } = buildPaginationQuery(page, limit);

    const where = {
      ...(status ? { status } : { status: { in: ['published', 'closed', 'achieved'] } }),
      ...(regionCode ? { regionCode } : {}),
    };

    const [petitions, total] = await Promise.all([
      this.prisma.petition.findMany({
        where,
        orderBy: sort === 'popular' ? { signatureCountCached: 'desc' } : { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.petition.count({ where }),
    ]);

    return { data: petitions, meta: buildPaginationMeta(total, page, limit) };
  }

  findOne(id: string) {
    return this.prisma.petition.findUniqueOrThrow({ where: { id } });
  }
}
