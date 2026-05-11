import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { classify } from '@change/ontology';

@Injectable()
export class ClassificationService {
  constructor(private prisma: PrismaService) {}

  async classifyAndSave(petitionId: string, title: string, content: string) {
    const result = classify(title, content);

    await this.prisma.petitionClassificationResult.create({
      data: {
        petitionId,
        primaryCategoryCode: result.primaryCategory,
        secondaryCategoryCodes: result.secondaryCategories,
        confidence: result.confidence,
        reviewRequired: result.reviewRequired,
        classifierVersion: '1.0.0',
      },
    });

    if (result.primaryCategory) {
      await this.prisma.petitionCategoryMapping.createMany({
        data: [
          { petitionId, categoryCode: result.primaryCategory, isPrimary: true },
          ...result.secondaryCategories.map((code) => ({
            petitionId,
            categoryCode: code,
            isPrimary: false,
          })),
        ],
        skipDuplicates: true,
      });
    }

    return result;
  }
}
