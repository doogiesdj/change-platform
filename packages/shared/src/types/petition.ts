export type PetitionStatus = 'review' | 'published' | 'rejected' | 'closed' | 'achieved';

export interface Petition {
  id: string;
  authorId: string;
  title: string;
  content: string;
  summary: string | null;
  status: PetitionStatus;
  regionCode: string | null;
  decisionMakerId: string | null;
  decisionMakerNameRaw: string | null;
  primaryCategoryCode: string | null;
  signatureCountCached: number;
  donationAmountCached: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  closedAt: Date | null;
}

export interface PetitionListItem {
  id: string;
  title: string;
  summary: string | null;
  status: PetitionStatus;
  primaryCategoryCode: string | null;
  signatureCountCached: number;
  createdAt: Date;
}

export interface PetitionCategoryMapping {
  id: string;
  petitionId: string;
  categoryCode: string;
  isPrimary: boolean;
  sourceType: 'auto' | 'manual';
  confidence: number | null;
}
