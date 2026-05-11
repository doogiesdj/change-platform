import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSignatureDto } from './dto/create-signature.dto';

@Injectable()
export class SignaturesService {
  constructor(private prisma: PrismaService) {}

  async create(petitionId: string, dto: CreateSignatureDto, userId: string) {
    const existing = await this.prisma.signature.findFirst({
      where: { petitionId, userId },
    });
    if (existing) throw new ConflictException('이미 서명한 청원입니다.');

    const signature = await this.prisma.signature.create({
      data: {
        petitionId,
        userId,
        displayName: dto.displayName,
        regionCode: dto.regionCode ?? null,
        ageBand: dto.ageBand ?? null,
        gender: dto.gender ?? null,
        consentToStatistics: dto.consentToStatistics,
      },
    });

    await this.prisma.petition.update({
      where: { id: petitionId },
      data: { signatureCountCached: { increment: 1 } },
    });

    return signature;
  }

  findByPetition(petitionId: string) {
    return this.prisma.signature.count({ where: { petitionId } });
  }
}
