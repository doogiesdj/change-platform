'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSignature, type CreateSignaturePayload, type SignatureCreated } from '@/lib/api/signatures';

interface PetitionData {
  signatureCount: number;
  [key: string]: unknown;
}

export function useCreateSignature(petitionId: string) {
  const queryClient = useQueryClient();
  return useMutation<SignatureCreated, Error, CreateSignaturePayload>({
    mutationFn: (payload) => createSignature(petitionId, payload),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['petition', petitionId] });
      const prev = queryClient.getQueryData<PetitionData>(['petition', petitionId]);
      if (prev) {
        queryClient.setQueryData<PetitionData>(['petition', petitionId], {
          ...prev,
          signatureCount: prev.signatureCount + 1,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { prev?: PetitionData };
      if (ctx?.prev) {
        queryClient.setQueryData(['petition', petitionId], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['petition', petitionId] });
    },
  });
}
