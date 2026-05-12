/**
 * One-time script: re-classify all petitions that have primaryCategoryCode = null.
 * Run with: npx ts-node -P tsconfig.seed.json prisma/reclassify.ts
 */
import { PrismaClient } from '@prisma/client';
import { classify } from '@change/ontology';

const prisma = new PrismaClient();

async function main() {
  const petitions = await prisma.petition.findMany({
    where: { primaryCategoryCode: null, deletedAt: null },
    select: { id: true, title: true, content: true },
  });

  console.log(`Re-classifying ${petitions.length} petition(s) with no category...`);

  let updated = 0;
  for (const p of petitions) {
    const result = classify({ title: p.title, content: p.content });
    if (!result.primaryCategoryCode) continue;

    await prisma.petition.update({
      where: { id: p.id },
      data: { primaryCategoryCode: result.primaryCategoryCode },
    });

    await prisma.petitionCategoryMapping.createMany({
      data: [
        { petitionId: p.id, categoryCode: result.primaryCategoryCode, isPrimary: true, confidence: result.confidence },
        ...result.secondaryCategoryCodes.map((code: string) => ({
          petitionId: p.id, categoryCode: code, isPrimary: false, confidence: result.confidence,
        })),
      ],
      skipDuplicates: true,
    });

    console.log(`  ✓ [${result.primaryCategoryCode}] ${p.title.slice(0, 50)}`);
    updated++;
  }

  console.log(`\nDone. ${updated}/${petitions.length} petition(s) classified.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
