import { apiClient } from './client';
import type { Petition, PetitionListItem, PetitionCreated, PaginationMeta, PetitionStatus } from '@change/shared';

export interface PetitionQueryParams {
  categoryCode?: string;
  regionCode?: string;
  status?: string;
  sort?: 'latest' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface CreatePetitionPayload {
  title: string;
  content: string;
  summary?: string;
  regionCode?: string;
}

export interface UpdatePetitionPayload {
  title?: string;
  content?: string;
  summary?: string;
  regionCode?: string;
}

export interface PetitionUpdate {
  id: string;
  petitionId: string;
  title: string | null;
  content: string;
  author: { id: string; displayName: string };
  createdAt: string;
}

export interface CreatePetitionUpdatePayload {
  title?: string;
  content: string;
}

export interface MyPetitionItem {
  id: string;
  title: string;
  status: PetitionStatus;
  signatureCount: number;
  createdAt: string;
}

export function getPetitions(params: PetitionQueryParams = {}) {
  const qs = new URLSearchParams();
  if (params.categoryCode) qs.set('categoryCode', params.categoryCode);
  if (params.regionCode) qs.set('regionCode', params.regionCode);
  if (params.status) qs.set('status', params.status);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  const query = qs.toString();
  return apiClient.get<{ items: PetitionListItem[]; meta: PaginationMeta }>(
    `/petitions${query ? `?${query}` : ''}`,
  );
}

export function getPetition(id: string) {
  return apiClient.get<Petition>(`/petitions/${id}`);
}

export function createPetition(data: CreatePetitionPayload) {
  return apiClient.post<PetitionCreated>('/petitions', data);
}

export function updatePetition(id: string, data: UpdatePetitionPayload) {
  return apiClient.patch<{ id: string; title: string; status: string }>(`/petitions/${id}`, data);
}

export function getMyPetitions() {
  return apiClient.get<{ items: MyPetitionItem[] }>('/petitions/me');
}

export function getPetitionUpdates(petitionId: string) {
  return apiClient.get<PetitionUpdate[]>(`/petitions/${petitionId}/updates`);
}

export function createPetitionUpdate(petitionId: string, data: CreatePetitionUpdatePayload) {
  return apiClient.post<PetitionUpdate>(`/petitions/${petitionId}/updates`, data);
}
