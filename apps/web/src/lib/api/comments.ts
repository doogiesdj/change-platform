import type { Comment } from '@change/shared';
import { apiClient } from './client';

export async function getComments(petitionId: string): Promise<Comment[]> {
  return apiClient.get<Comment[]>(`/petitions/${petitionId}/comments`);
}

export async function createComment(
  petitionId: string,
  data: { content: string; parentId?: string },
): Promise<Comment> {
  return apiClient.post<Comment>(`/petitions/${petitionId}/comments`, data);
}

export async function deleteComment(commentId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/comments/${commentId}`);
}
