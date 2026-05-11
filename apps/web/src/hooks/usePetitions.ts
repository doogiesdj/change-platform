import { useQuery } from '@tanstack/react-query';
import { getPetitions, type PetitionQueryParams } from '@/lib/api/petitions';

export function usePetitions(params: PetitionQueryParams = {}) {
  return useQuery({
    queryKey: ['petitions', params],
    queryFn: () => getPetitions(params),
    staleTime: 30_000,
  });
}
