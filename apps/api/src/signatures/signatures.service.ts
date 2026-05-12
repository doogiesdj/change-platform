import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateSignatureDto } from './dto/create-signature.dto';

@Injectable()
export class SignaturesService {
  constructor(private prisma: PrismaService) {}

  async create(petitionId: string, dto: CreateSignatureDto, userId: string) {
    const petition = await this.prisma.petition.findUnique({
      where: { id: petitionId, deletedAt: null },
      select: { id: true, status: true },
    });

    if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');
    if (petition.status !== 'published') {
      throw new UnprocessableEntityException('현재 서명을 받지 않는 청원입니다.');
    }

    try {
      const [signature] = await this.prisma.$transaction([
        this.prisma.signature.create({
          data: {
            petitionId,
            userId,
            displayName: dto.displayName,
            regionCode: dto.regionCode ?? null,
            ageBand: dto.ageBand ?? null,
            gender: dto.gender ?? null,
            comment: dto.comment ?? null,
            consentToStatistics: dto.consentToStatistics,
          },
          select: { id: true, petitionId: true, createdAt: true },
        }),
        this.prisma.petition.update({
          where: { id: petitionId },
          data: { signatureCountCached: { increment: 1 } },
        }),
      ]);

      return signature;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('이미 서명한 청원입니다.');
      }
      throw err;
    }
  }

  async getStats(petitionId: string) {
    const petition = await this.prisma.petition.findUnique({
      where: { id: petitionId, deletedAt: null },
      select: { id: true, signatureCountCached: true },
    });
    if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');

    const statsWhere = { petitionId, consentToStatistics: true };

    const [byRegionRaw, byAgeBandRaw, byGenderRaw] = await Promise.all([
      this.prisma.signature.groupBy({
        by: ['regionCode'],
        where: statsWhere,
        _count: { id: true },
      }),
      this.prisma.signature.groupBy({
        by: ['ageBand'],
        where: statsWhere,
        _count: { id: true },
      }),
      this.prisma.signature.groupBy({
        by: ['gender'],
        where: statsWhere,
        _count: { id: true },
      }),
    ]);

    return {
      total: petition.signatureCountCached,
      byRegion: byRegionRaw
        .filter((r) => r.regionCode)
        .map((r) => ({ regionCode: r.regionCode!, count: r._count.id })),
      byAgeBand: byAgeBandRaw
        .filter((r) => r.ageBand)
        .map((r) => ({ ageBand: r.ageBand!, count: r._count.id })),
      byGender: byGenderRaw
        .filter((r) => r.gender)
        .map((r) => ({ gender: r.gender!, count: r._count.id })),
    };
  }
}
