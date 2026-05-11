import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDonationDto, userId: string) {
    if (dto.targetType === 'petition' && dto.targetId) {
      const petition = await this.prisma.petition.findUnique({
        where: { id: dto.targetId },
      });
      if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');
    }

    return this.prisma.donation.create({
      data: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId ?? null,
        amount: dto.amount,
        donationType: dto.donationType,
        billingCycle: dto.billingCycle ?? null,
        isAnonymous: dto.isAnonymous ?? false,
        message: dto.message ?? null,
        status: 'pending',
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByPetition(petitionId: string) {
    return this.prisma.donation.aggregate({
      where: { targetId: petitionId, targetType: 'petition', status: 'completed' },
      _sum: { amount: true },
      _count: true,
    });
  }
}
