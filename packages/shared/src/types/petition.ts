export type PetitionStatus = 'review' | 'published' | 'rejected' | 'closed' | 'achieved';

export interface PetitionAuthor {
  id: string;
  displayName: string;
}

export interface PetitionCategoryItem {
  code: string;
  label: string;
  isPrimary: boolean;
}

/** Shape returned by GET /petitions/:id */
export interface Petition {
  id: string;
  authorId: string;
  title: string;
  content: string;
  summary: string | null;
  status: PetitionStatus;
  regionCode: string | null;
  primaryCategoryCode: string | null;
  author: PetitionAuthor;
  decisionMaker: { id: string; name: string } | null;
  categories: PetitionCategoryItem[];
  signatureCount: number;
  donationAmount: number;
  targetSignatureCount: number | null;
  createdAt: string;
  publishedAt: string | null;
}

/** Shape returned by GET /petitions list */
export interface PetitionListItem {
  id: string;
  title: string;
  status: PetitionStatus;
  primaryCategoryCode: string | null;
  regionCode: string | null;
  signatureCount: number;
  donationAmount: number;
  createdAt: string;
}

/** Shape returned by POST /petitions */
export interface PetitionCreated {
  id: string;
  title: string;
  content: string;
  status: PetitionStatus;
  authorId: string;
  primaryCategoryCode: string | null;
  createdAt: string;
}

export interface PetitionCategoryMapping {
  id: string;
  petitionId: string;
  categoryCode: string;
  isPrimary: boolean;
  sourceType: 'auto' | 'manual';
  confidence: number | null;
}
