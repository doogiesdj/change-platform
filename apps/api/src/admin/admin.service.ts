import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [userCount, petitionCount, signatureCount, donationSum] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.petition.count(),
      this.prisma.signature.count(),
      this.prisma.donation.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    return {
      userCount,
      petitionCount,
      signatureCount,
      totalDonationAmount: donationSum._sum.amount ?? 0,
    };
  }

  findUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  getAuditLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.adminAuditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, displayName: true } },
      },
    });
  }
}
