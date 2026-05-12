import { KEYWORD_DICTIONARY } from '../dictionaries/keywords';
import { INSTITUTION_CATEGORY_MAP } from '../dictionaries/institutions';
import { type CategoryScore } from './types';
import { normalize } from './normalizer';

export type { CategoryScore } from './types';

export function scoreCategories(title: string, content: string): CategoryScore[] {
  const normalizedTitle = normalize(title);
  const normalizedContent = normalize(content);
  const fullText = `${normalizedTitle} ${normalizedContent}`;
  const scores: Record<string, CategoryScore> = {};

  for (const [code, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
    const matched: string[] = [];
    let score = 0;
    for (const kw of keywords) {
      const normalizedKw = normalize(kw);
      const inTitle = normalizedTitle.includes(normalizedKw);
      const inContent = normalizedContent.includes(normalizedKw);
      if (inTitle || inContent) {
        matched.push(kw);
        if (inTitle) score += 2;
        if (inContent) score += 1;
      }
    }
    if (score > 0) {
      scores[code] = { code, score, matchedKeywords: matched, matchedEntities: [] };
    }
  }

  for (const [institution, codes] of Object.entries(INSTITUTION_CATEGORY_MAP)) {
    if (fullText.includes(normalize(institution))) {
      for (const code of codes) {
        if (scores[code]) {
          scores[code].score += 2;
          scores[code].matchedEntities.push(institution);
        } else {
          scores[code] = { code, score: 2, matchedKeywords: [], matchedEntities: [institution] };
        }
      }
    }
  }

  return Object.values(scores).sort((a, b) => b.score - a.score);
}
