import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment, deleteComment } from '../lib/api/comments';

export function useComments(petitionId: string) {
  return useQuery({
    queryKey: ['comments', petitionId],
    queryFn: () => getComments(petitionId),
  });
}

export function useCreateComment(petitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      createComment(petitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', petitionId] });
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
    },
  });
}

export function useDeleteComment(petitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', petitionId] });
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
    },
  });
}
