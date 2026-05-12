'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPetitions,
  getPetition,
  createPetition,
  updatePetition,
  getMyPetitions,
  getPetitionUpdates,
  createPetitionUpdate,
  type PetitionQueryParams,
  type CreatePetitionPayload,
  type UpdatePetitionPayload,
  type CreatePetitionUpdatePayload,
} from '@/lib/api/petitions';

export function usePetitions(params: PetitionQueryParams = {}) {
  return useQuery({
    queryKey: ['petitions', params],
    queryFn: () => getPetitions(params),
    staleTime: 30_000,
  });
}

export function usePetition(id: string) {
  return useQuery({
    queryKey: ['petition', id],
    queryFn: () => getPetition(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useMyPetitions() {
  return useQuery({
    queryKey: ['petitions', 'me'],
    queryFn: getMyPetitions,
    staleTime: 30_000,
  });
}

export function useCreatePetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePetitionPayload) => createPetition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
    },
  });
}

export function useUpdatePetition(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePetitionPayload) => updatePetition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition', id] });
      queryClient.invalidateQueries({ queryKey: ['petitions', 'me'] });
    },
  });
}

export function usePetitionUpdates(petitionId: string) {
  return useQuery({
    queryKey: ['petition-updates', petitionId],
    queryFn: () => getPetitionUpdates(petitionId),
    staleTime: 60_000,
    enabled: !!petitionId,
  });
}

export function useCreatePetitionUpdate(petitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePetitionUpdatePayload) => createPetitionUpdate(petitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition-updates', petitionId] });
    },
  });
}
