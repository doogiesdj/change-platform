import { KEYWORD_DICTIONARY } from '../dictionaries/keywords';
import { SYNONYM_DICTIONARY } from '../dictionaries/synonyms';
import { INSTITUTION_CATEGORY_MAP } from '../dictionaries/institutions';

export interface CategoryScore {
  code: string;
  score: number;
  matchedKeywords: string[];
  matchedEntities: string[];
}

function normalize(text: string): string {
  let result = text.toLowerCase().replace(/\s+/g, '');
  for (const [synonym, canonical] of Object.entries(SYNONYM_DICTIONARY)) {
    result = result.replace(new RegExp(synonym, 'g'), canonical);
  }
  return result;
}

export function scoreCategories(title: string, content: string): CategoryScore[] {
  const fullText = normalize(`${title} ${content}`);
  const scores: Record<string, CategoryScore> = {};

  for (const [code, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
    const matched: string[] = [];
    for (const kw of keywords) {
      if (fullText.includes(normalize(kw))) {
        matched.push(kw);
      }
    }
    if (matched.length > 0) {
      scores[code] = { code, score: matched.length, matchedKeywords: matched, matchedEntities: [] };
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
