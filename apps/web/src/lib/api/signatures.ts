import { apiClient } from './client';

export interface CreateSignaturePayload {
  displayName: string;
  regionCode?: string;
  ageBand?: string;
  gender?: string;
  comment?: string;
  consentToStatistics: boolean;
}

export interface SignatureCreated {
  id: string;
  petitionId: string;
  createdAt: string;
}

export interface SignatureStats {
  total: number;
  byRegion: { regionCode: string; count: number }[];
  byAgeBand: { ageBand: string; count: number }[];
  byGender: { gender: string; count: number }[];
}

export function createSignature(petitionId: string, payload: CreateSignaturePayload) {
  return apiClient.post<SignatureCreated>(
    `/petitions/${petitionId}/signatures`,
    payload,
  );
}

export function getSignatureStats(petitionId: string) {
  return apiClient.get<SignatureStats>(
    `/petitions/${petitionId}/signatures/stats`,
  );
}
