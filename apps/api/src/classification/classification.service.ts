import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { classify } from '@change/ontology';

@Injectable()
export class ClassificationService {
  static readonly VERSION = '1.0.0';

  constructor(private prisma: PrismaService) {}

  async classifyAndSave(petitionId: string, title: string, content: string) {
    const result = classify({ title, content });

    const classificationResult = await this.prisma.petitionClassificationResult.create({
      data: {
        petitionId,
        classifierVersion: ClassificationService.VERSION,
        primaryCategoryCode: result.primaryCategoryCode,
        secondaryCategoryCodesJson: result.secondaryCategoryCodes,
        matchedKeywordsJson: result.matchedKeywords,
        matchedEntitiesJson: result.matchedEntities,
        confidence: result.confidence,
        reviewRequired: result.reviewRequired,
        rawReasoningSummary: result.rawReasoningSummary,
      },
    });

    if (result.primaryCategoryCode) {
      await this.prisma.petition.update({
        where: { id: petitionId },
        data: { primaryCategoryCode: result.primaryCategoryCode },
      });

      // Category codes must exist in petition_categories seed table; skip silently if not seeded yet
      try {
        await this.prisma.petitionCategoryMapping.createMany({
          data: [
            {
              petitionId,
              categoryCode: result.primaryCategoryCode,
              isPrimary: true,
              confidence: result.confidence,
            },
            ...result.secondaryCategoryCodes.map((code: string) => ({
              petitionId,
              categoryCode: code,
              isPrimary: false,
              confidence: result.confidence,
            })),
          ],
          skipDuplicates: true,
        });
      } catch {
        // FK violation means the category code isn't seeded — non-fatal for MVP
      }
    }

    if (result.reviewRequired) {
      const reason = result.confidence < 0.4 ? 'low_confidence' : 'policy';
      await this.prisma.reviewQueue.upsert({
        where: { petitionId },
        update: {
          latestClassificationResultId: classificationResult.id,
          reviewReason: reason,
          reviewStatus: 'pending',
        },
        create: {
          petitionId,
          latestClassificationResultId: classificationResult.id,
          reviewReason: reason,
          reviewStatus: 'pending',
        },
      });
    }

    return result;
  }
}
