export interface ClassifyInput {
  title: string;
  content: string;
  regionCode?: string;
  decisionMakerId?: string;
}

export interface ClassificationResult {
  primaryCategoryCode: string;
  secondaryCategoryCodes: string[];
  confidence: number;
  matchedKeywords: string[];
  matchedEntities: string[];
  reviewRequired: boolean;
  rawReasoningSummary: string;
}

export interface CategoryScore {
  code: string;
  score: number;
  matchedKeywords: string[];
  matchedEntities: string[];
}
