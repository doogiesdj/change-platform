import { apiClient } from './client';
import type { Petition, PetitionListItem } from '@change/shared';
import type { PaginatedResponse } from '@change/shared';

export interface PetitionQueryParams {
  categoryCode?: string;
  regionCode?: string;
  page?: number;
  limit?: number;
}

export function getPetitions(params: PetitionQueryParams = {}) {
  const qs = new URLSearchParams();
  if (params.categoryCode) qs.set('categoryCode', params.categoryCode);
  if (params.regionCode) qs.set('regionCode', params.regionCode);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return apiClient.get<{ data: PaginatedResponse<PetitionListItem> }>(
    `/petitions${query ? `?${query}` : ''}`,
  );
}

export function getPetition(id: string) {
  return apiClient.get<{ data: Petition }>(`/petitions/${id}`);
}

export function createPetition(data: {
  title: string;
  content: string;
  summary?: string;
  regionCode?: string;
  hashtags?: string[];
}) {
  return apiClient.post<{ data: Petition }>('/petitions', data);
}
