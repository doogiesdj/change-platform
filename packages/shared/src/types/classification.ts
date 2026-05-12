export interface ClassificationResult {
  primaryCategoryCode: string;
  secondaryCategoryCodes: string[];
  confidence: number;
  matchedKeywords: string[];
  matchedEntities: string[];
  reviewRequired: boolean;
  rawReasoningSummary: string;
}
