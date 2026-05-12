import { scoreCategories } from './scorer';
import { type ClassifyInput, type ClassificationResult, type CategoryScore } from './types';
import { CATEGORIES } from '../data/categories';

export type { ClassifyInput, ClassificationResult } from './types';

const CONFIDENCE_THRESHOLD = 0.4;
const MULTI_CATEGORY_THRESHOLD = 3;
const BUBBLE_UP_FACTOR = 0.5;

const SYNTHETIC_CODES = new Set(['UNC', 'MIX', 'REV']);

export function classify(input: ClassifyInput): ClassificationResult {
  const { title, content } = input;
  const rawScores = scoreCategories(title, content);

  if (rawScores.length === 0) {
    return emptyResult('분류 기준에 맞는 키워드를 찾지 못했습니다.');
  }

  const scoreMap = new Map<string, CategoryScore>(rawScores.map((s) => [s.code, s]));
  const getScore = (code: string): number => scoreMap.get(code)?.score ?? 0;

  const l2ByParent = new Map<string, string[]>();
  const l3ByParent = new Map<string, string[]>();
  for (const cat of CATEGORIES) {
    if (!cat.parentCode) continue;
    if (cat.level === 2) {
      const arr = l2ByParent.get(cat.parentCode) ?? [];
      arr.push(cat.code);
      l2ByParent.set(cat.parentCode, arr);
    } else if (cat.level === 3) {
      const arr = l3ByParent.get(cat.parentCode) ?? [];
      arr.push(cat.code);
      l3ByParent.set(cat.parentCode, arr);
    }
  }

  const l1Codes = CATEGORIES.filter((c) => c.level === 1 && !SYNTHETIC_CODES.has(c.code)).map(
    (c) => c.code,
  );

  const effectiveScores = l1Codes
    .map((l1Code) => {
      const direct = getScore(l1Code);
      const childSum = (l2ByParent.get(l1Code) ?? []).reduce(
        (sum, l2Code) => sum + getScore(l2Code),
        0,
      );
      return { code: l1Code, effectiveScore: direct + BUBBLE_UP_FACTOR * childSum };
    })
    .filter((s) => s.effectiveScore > 0)
    .sort((a, b) => b.effectiveScore - a.effectiveScore);

  if (effectiveScores.length === 0) {
    return emptyResult('분류 기준에 맞는 카테고리를 찾지 못했습니다.');
  }

  const topL1 = effectiveScores[0];
  const totalEffective = effectiveScores.reduce((sum, s) => sum + s.effectiveScore, 0);
  const confidence = totalEffective === 0 ? 0 : topL1.effectiveScore / totalEffective;

  const bestL2 = bestChild(l2ByParent.get(topL1.code) ?? [], getScore);
  const bestL3 = bestL2 ? bestChild(l3ByParent.get(bestL2.code) ?? [], getScore) : null;

  const primaryCategoryCode = bestL3?.code ?? bestL2?.code ?? topL1.code;

  const secondary = effectiveScores
    .slice(1)
    .filter((s) => s.effectiveScore >= MULTI_CATEGORY_THRESHOLD)
    .map((s) => s.code);

  const reviewRequired =
    confidence < CONFIDENCE_THRESHOLD || secondary.length >= 2 || primaryCategoryCode === 'UNC';

  return {
    primaryCategoryCode,
    secondaryCategoryCodes: secondary,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords: [...new Set(rawScores.flatMap((s) => s.matchedKeywords))],
    matchedEntities: [...new Set(rawScores.flatMap((s) => s.matchedEntities))],
    reviewRequired,
    rawReasoningSummary: `L1: ${topL1.code} (유효점수: ${topL1.effectiveScore.toFixed(1)}), 주카테고리: ${primaryCategoryCode}, confidence: ${confidence.toFixed(2)}`,
  };
}

function bestChild(
  codes: string[],
  getScore: (code: string) => number,
): { code: string; score: number } | null {
  let best: { code: string; score: number } | null = null;
  for (const code of codes) {
    const score = getScore(code);
    if (score > 0 && (!best || score > best.score)) {
      best = { code, score };
    }
  }
  return best;
}

function emptyResult(reason: string): ClassificationResult {
  return {
    primaryCategoryCode: 'UNC',
    secondaryCategoryCodes: [],
    confidence: 0,
    matchedKeywords: [],
    matchedEntities: [],
    reviewRequired: true,
    rawReasoningSummary: reason,
  };
}
