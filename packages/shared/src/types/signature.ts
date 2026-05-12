export type AgeBand = 'under_19' | '20_29' | '30_39' | '40_49' | '50_59' | '60_plus' | 'unknown';
export type Gender = 'male' | 'female' | 'other' | 'unknown';

export interface Signature {
  id: string;
  petitionId: string;
  userId: string | null;
  displayName: string;
  regionCode: string | null;
  ageBand: AgeBand | null;
  gender: Gender | null;
  consentToStatistics: boolean;
  createdAt: Date;
}
