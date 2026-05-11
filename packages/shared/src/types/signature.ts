export type AgeBand = '10s' | '20s' | '30s' | '40s' | '50s' | '60s' | '70plus' | 'unknown';
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

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
