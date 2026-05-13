'use client';

import { useState } from 'react';
import type { Comment } from '@change/shared';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useCurrentUser } from '@/hooks/useCurrentUser';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  currentUserRole?: string;
  onDelete: (id: string) => void;
  onReply: (parentId: string, parentAuthor: string) => void;
}

function CommentItem({ comment, currentUserId, currentUserRole, onDelete, onReply }: CommentItemProps) {
  const canDelete =
    currentUserId === comment.authorId ||
    currentUserRole === 'admin' ||
    currentUserRole === 'moderator';

  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
          {comment.author.displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{comment.author.displayName}</span>
            <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          <div className="mt-2 flex items-center gap-3">
            {currentUserId && (
              <button
                onClick={() => onReply(comment.id, comment.author.displayName)}
                className="text-xs text-gray-400 hover:text-primary-600 transition-colors"
              >
                답글
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                삭제
              </button>
            )}
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 space-y-3 border-l-2 border-gray-100 pl-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                    {reply.author.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{reply.author.displayName}</span>
                      <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                    {canDelete && (
                      <button
                        onClick={() => onDelete(reply.id)}
                        className="mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  petitionId: string;
}

export function CommentSection({ petitionId }: Props) {
  const { user, isAuthenticated } = useCurrentUser();
  const { data: comments, isLoading } = useComments(petitionId);
  const { mutate: createComment, isPending: isSubmitting } = useCreateComment(petitionId);
  const { mutate: deleteComment } = useDeleteComment(petitionId);

  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }
    setError('');
    createComment(
      { content: content.trim(), parentId: replyTo?.id },
      {
        onSuccess: () => {
          setContent('');
          setReplyTo(null);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : '댓글 등록에 실패했습니다.');
        },
      },
    );
  }

  const total = comments
    ? comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0)
    : 0;

  return (
    <div id="comments" className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-base font-semibold text-gray-900 mb-6">
        댓글 {total > 0 && <span className="text-gray-400 font-normal">({total})</span>}
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-primary-700 bg-primary-50 px-3 py-2 rounded-lg">
              <span>{replyTo.author}님에게 답글 작성 중</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-auto text-gray-400 hover:text-gray-600 text-xs"
              >
                취소
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isAuthenticated ? '댓글을 작성하세요...' : '로그인 후 댓글을 작성할 수 있습니다.'}
            rows={3}
            maxLength={1000}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">{content.length}/1000</span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
          로그인 후 댓글을 작성할 수 있습니다.
        </p>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments && comments.length === 0 && (
        <p className="text-sm text-gray-400 py-4">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
      )}

      {!isLoading && comments && comments.length > 0 && (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              currentUserRole={user?.role}
              onDelete={(id) => deleteComment(id)}
              onReply={(id, author) => setReplyTo({ id, author })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
