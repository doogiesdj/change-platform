import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { REVIEW_STATUS, REVIEW_DECISION, type ReviewDecision, PETITION_STATUS } from '@change/shared';

@Injectable()
export class ReviewQueueService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string) {
    const VALID_STATUSES = [
      REVIEW_STATUS.PENDING,
      REVIEW_STATUS.APPROVED,
      REVIEW_STATUS.REJECTED,
      REVIEW_STATUS.RECLASSIFIED,
    ] as string[];

    const where = status && VALID_STATUSES.includes(status)
      ? { reviewStatus: status as (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS] }
      : {};

    return this.prisma.reviewQueue.findMany({
      where,
      include: {
        petition: { select: { id: true, title: true, status: true, createdAt: true } },
        latestClassificationResult: {
          select: { primaryCategoryCode: true, confidence: true, rawReasoningSummary: true },
        },
        assignedModerator: { select: { id: true, displayName: true } },
        reviewedBy: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.reviewQueue.findUnique({
      where: { id },
      include: {
        petition: {
          select: {
            id: true,
            title: true,
            content: true,
            status: true,
            primaryCategoryCode: true,
            createdAt: true,
            authorId: true,
          },
        },
        latestClassificationResult: true,
        assignedModerator: { select: { id: true, displayName: true } },
        reviewedBy: { select: { id: true, displayName: true } },
      },
    });

    if (!item) throw new NotFoundException('검토 항목을 찾을 수 없습니다.');
    return item;
  }

  async assign(reviewId: string, moderatorId: string) {
    const item = await this.prisma.reviewQueue.findUnique({ where: { id: reviewId } });
    if (!item) throw new NotFoundException('검토 항목을 찾을 수 없습니다.');
    if (item.reviewStatus !== REVIEW_STATUS.PENDING) {
      throw new BadRequestException('이미 처리된 검토 항목입니다.');
    }

    return this.prisma.reviewQueue.update({
      where: { id: reviewId },
      data: { assignedModeratorId: moderatorId },
    });
  }

  async deleteFromQueue(reviewId: string, adminId: string) {
    const item = await this.prisma.reviewQueue.findUnique({
      where: { id: reviewId },
      include: { petition: { select: { id: true, status: true, primaryCategoryCode: true } } },
    });
    if (!item) throw new NotFoundException('검토 항목을 찾을 수 없습니다.');

    const now = new Date();

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.petition.update({
          where: { id: item.petitionId },
          data: { deletedAt: now },
        });

        await tx.reviewQueue.delete({ where: { id: reviewId } });

        await tx.adminAuditLog.create({
          data: {
            actorUserId: adminId,
            actionType: 'delete',
            targetType: 'petition',
            targetId: item.petitionId,
            beforeJson: {
              reviewStatus: item.reviewStatus,
              petitionStatus: item.petition.status,
              primaryCategoryCode: item.petition.primaryCategoryCode,
            },
            afterJson: { deletedAt: now.toISOString() },
            metadataJson: { source: 'review_queue', reviewId },
          },
        });
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('삭제 처리 중 오류가 발생했습니다.');
    }

    return { id: reviewId, petitionId: item.petitionId, deleted: true };
  }

  async decide(
    reviewId: string,
    decision: ReviewDecision,
    moderatorId: string,
    note?: string,
    newCategoryCode?: string,
  ) {
    const item = await this.prisma.reviewQueue.findUnique({
      where: { id: reviewId },
      include: { petition: true },
    });
    if (!item) throw new NotFoundException('검토 항목을 찾을 수 없습니다.');
    if (item.reviewStatus !== REVIEW_STATUS.PENDING) {
      throw new BadRequestException('이미 처리된 검토 항목입니다.');
    }
    if (decision === REVIEW_DECISION.RECLASSIFY && !newCategoryCode) {
      throw new BadRequestException('reclassify 결정 시 newCategoryCode가 필요합니다.');
    }

    const newReviewStatus =
      decision === REVIEW_DECISION.APPROVE
        ? REVIEW_STATUS.APPROVED
        : decision === REVIEW_DECISION.REJECT
          ? REVIEW_STATUS.REJECTED
          : REVIEW_STATUS.RECLASSIFIED;

    const newPetitionStatus =
      decision === REVIEW_DECISION.REJECT ? PETITION_STATUS.REJECTED : PETITION_STATUS.PUBLISHED;

    const now = new Date();

    try {
      await this.prisma.$transaction(async (tx) => {
        if (decision === REVIEW_DECISION.RECLASSIFY && newCategoryCode) {
          const category = await tx.petitionCategory.findUnique({ where: { code: newCategoryCode } });
          if (!category) {
            throw new BadRequestException(`존재하지 않는 카테고리 코드입니다: ${newCategoryCode}`);
          }
        }
        await tx.reviewQueue.update({
          where: { id: reviewId },
          data: {
            reviewStatus: newReviewStatus,
            reviewedById: moderatorId,
            reviewedAt: now,
            note: note ?? null,
          },
        });

        await tx.petition.update({
          where: { id: item.petitionId },
          data: {
            status: newPetitionStatus,
            ...(newPetitionStatus === PETITION_STATUS.PUBLISHED && { publishedAt: now }),
            ...(newPetitionStatus === PETITION_STATUS.REJECTED && { rejectedAt: now }),
            ...(decision === REVIEW_DECISION.RECLASSIFY &&
              newCategoryCode && { primaryCategoryCode: newCategoryCode }),
          },
        });

        if (decision === REVIEW_DECISION.RECLASSIFY && newCategoryCode) {
          await tx.petitionCategoryMapping.updateMany({
            where: { petitionId: item.petitionId, isPrimary: true },
            data: { isPrimary: false },
          });
          await tx.petitionCategoryMapping.upsert({
            where: {
              petitionId_categoryCode: {
                petitionId: item.petitionId,
                categoryCode: newCategoryCode,
              },
            },
            update: { isPrimary: true, sourceType: 'manual' },
            create: {
              petitionId: item.petitionId,
              categoryCode: newCategoryCode,
              isPrimary: true,
              sourceType: 'manual',
              confidence: 1.0,
            },
          });
        }

        await tx.adminAuditLog.create({
          data: {
            actorUserId: moderatorId,
            actionType: decision,
            targetType: 'review_queue',
            targetId: reviewId,
            beforeJson: {
              reviewStatus: item.reviewStatus,
              petitionStatus: item.petition.status,
              primaryCategoryCode: item.petition.primaryCategoryCode,
            },
            afterJson: {
              reviewStatus: newReviewStatus,
              petitionStatus: newPetitionStatus,
              primaryCategoryCode:
                decision === REVIEW_DECISION.RECLASSIFY ? newCategoryCode : item.petition.primaryCategoryCode,
            },
            metadataJson: { decision, note: note ?? null },
          },
        });
      });
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('검토 처리 중 오류가 발생했습니다.');
    }

    return this.findOne(reviewId);
  }
}
