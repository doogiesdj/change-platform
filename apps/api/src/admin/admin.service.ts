import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ClassificationService } from '../classification/classification.service';
import { AUDIT_ACTION, REVIEW_STATUS, PETITION_STATUS } from '@change/shared';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private classificationService: ClassificationService,
  ) {}

  async getDashboardOverview() {
    const [
      totalUsers,
      totalPetitions,
      publishedPetitions,
      pendingReviewPetitions,
      totalSignatures,
      donationSum,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.petition.count(),
      this.prisma.petition.count({ where: { status: PETITION_STATUS.PUBLISHED } }),
      this.prisma.reviewQueue.count({ where: { reviewStatus: REVIEW_STATUS.PENDING } }),
      this.prisma.signature.count(),
      this.prisma.donation.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalPetitions,
      publishedPetitions,
      pendingReviewPetitions,
      totalSignatures,
      totalDonationAmount: donationSum._sum.amount ?? 0,
    };
  }

  async getDashboardSignatures() {
    const [byRegionRaw, byAgeBandRaw, byGenderRaw] = await Promise.all([
      this.prisma.signature.groupBy({
        by: ['regionCode'],
        where: { consentToStatistics: true, regionCode: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { regionCode: 'desc' } },
      }),
      this.prisma.signature.groupBy({
        by: ['ageBand'],
        where: { consentToStatistics: true, ageBand: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.signature.groupBy({
        by: ['gender'],
        where: { consentToStatistics: true, gender: { not: null } },
        _count: { _all: true },
      }),
    ]);

    return {
      byRegion: byRegionRaw.map(r => ({ region: r.regionCode!, count: r._count._all })),
      byAgeBand: byAgeBandRaw.map(r => ({ ageBand: r.ageBand!, count: r._count._all })),
      byGender: byGenderRaw.map(r => ({ gender: r.gender!, count: r._count._all })),
    };
  }

  async getDashboardDonations() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [byTargetTypeRaw, recentSum, totalSum] = await Promise.all([
      this.prisma.donation.groupBy({
        by: ['targetType'],
        where: { status: 'paid' },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'paid', paidAt: { gte: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalAmount: totalSum._sum.amount ?? 0,
      recentTotal: recentSum._sum.amount ?? 0,
      byTargetType: byTargetTypeRaw.map(r => ({
        targetType: r.targetType,
        amount: r._sum.amount ?? 0,
        count: r._count._all,
      })),
    };
  }

  async getDashboardPetitions() {
    const [byStatusRaw, byCategoryRaw] = await Promise.all([
      this.prisma.petition.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.petition.groupBy({
        by: ['primaryCategoryCode'],
        where: { primaryCategoryCode: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { primaryCategoryCode: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      byStatus: byStatusRaw.map(r => ({ status: r.status, count: r._count._all })),
      byCategory: byCategoryRaw.map(r => ({
        categoryCode: r.primaryCategoryCode!,
        count: r._count._all,
      })),
    };
  }

  async findUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
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
      }),
      this.prisma.user.count(),
    ]);
    return { data, total };
  }

  async updateUserRole(userId: string, role: UserRole, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorId,
        actionType: AUDIT_ACTION.USER_ROLE_UPDATE,
        targetType: 'user',
        targetId: userId,
        beforeJson: { role: user.role },
        afterJson: { role },
      },
    });

    return updated;
  }

  getAuditLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.adminAuditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, displayName: true } },
      },
    });
  }

  async reclassifyAll() {
    const petitions = await this.prisma.petition.findMany({
      select: { id: true, title: true, content: true },
    });

    let success = 0;
    let failed = 0;
    for (const p of petitions) {
      try {
        await this.classificationService.classifyAndSave(p.id, p.title, p.content);
        success++;
      } catch {
        failed++;
      }
    }

    return { total: petitions.length, success, failed };
  }
}
