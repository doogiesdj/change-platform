import { scoreCategories, type CategoryScore } from './scorer';

const CONFIDENCE_THRESHOLD = 0.4;
const MULTI_CATEGORY_THRESHOLD = 2;

export interface ClassificationResult {
  primaryCategoryCode: string | null;
  secondaryCategoryCodes: string[];
  confidence: number;
  matchedKeywords: string[];
  matchedEntities: string[];
  reviewRequired: boolean;
  rawReasoningSummary: string;
}

export function classify(title: string, content: string): ClassificationResult {
  const scores = scoreCategories(title, content);

  if (scores.length === 0) {
    return {
      primaryCategoryCode: 'UNC',
      secondaryCategoryCodes: [],
      confidence: 0,
      matchedKeywords: [],
      matchedEntities: [],
      reviewRequired: true,
      rawReasoningSummary: '분류 기준에 맞는 키워드를 찾지 못했습니다.',
    };
  }

  const topScore = scores[0];
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const confidence = totalScore === 0 ? 0 : topScore.score / totalScore;

  const secondary = scores
    .slice(1)
    .filter((s) => s.score >= MULTI_CATEGORY_THRESHOLD)
    .map((s) => s.code);

  const reviewRequired =
    confidence < CONFIDENCE_THRESHOLD ||
    secondary.length >= 2 ||
    topScore.code === 'UNC';

  const allKeywords = scores.flatMap((s) => s.matchedKeywords);
  const allEntities = scores.flatMap((s) => s.matchedEntities);

  return {
    primaryCategoryCode: topScore.code,
    secondaryCategoryCodes: secondary,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords: [...new Set(allKeywords)],
    matchedEntities: [...new Set(allEntities)],
    reviewRequired,
    rawReasoningSummary: `최고 카테고리: ${topScore.code} (점수: ${topScore.score}), confidence: ${confidence.toFixed(2)}`,
  };
}
