import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReviewQueueService {
  constructor(private prisma: PrismaService) {}

  findPending() {
    return this.prisma.reviewQueue.findMany({
      where: { status: 'pending' },
      include: {
        petition: { select: { id: true, title: true, status: true, createdAt: true } },
        assignedModerator: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async assign(reviewId: string, moderatorId: string) {
    const item = await this.prisma.reviewQueue.findUnique({ where: { id: reviewId } });
    if (!item) throw new NotFoundException('검토 항목을 찾을 수 없습니다.');

    return this.prisma.reviewQueue.update({
      where: { id: reviewId },
      data: { assignedModeratorId: moderatorId, status: 'in_review' },
    });
  }

  async decide(
    reviewId: string,
    decision: 'approve' | 'reject',
    moderatorId: string,
    note?: string,
  ) {
    const item = await this.prisma.reviewQueue.findUnique({
      where: { id: reviewId },
      include: { petition: true },
    });
    if (!item) throw new NotFoundException('검토 항목을 찾을 수 없습니다.');

    const newPetitionStatus = decision === 'approve' ? 'published' : 'rejected';

    const [review] = await this.prisma.$transaction([
      this.prisma.reviewQueue.update({
        where: { id: reviewId },
        data: {
          status: decision === 'approve' ? 'approved' : 'rejected',
          resolvedAt: new Date(),
          moderatorNote: note ?? null,
        },
      }),
      this.prisma.petition.update({
        where: { id: item.petitionId },
        data: { status: newPetitionStatus },
      }),
    ]);

    return review;
  }
}
