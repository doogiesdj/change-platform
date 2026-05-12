'use client';

import { useEffect, useState } from 'react';
import { adminApi, type ReviewQueueItem, type DecideReviewDto } from '@/lib/api/admin';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const STATUS_TABS = [
  { label: '전체', value: '' },
  { label: '대기중', value: 'pending' },
  { label: '승인', value: 'approved' },
  { label: '반려', value: 'rejected' },
  { label: '재분류', value: 'reclassified' },
] as const;

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: '대기중', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '승인', className: 'bg-green-100 text-green-700' },
  rejected: { label: '반려', className: 'bg-red-100 text-red-700' },
  reclassified: { label: '재분류', className: 'bg-blue-100 text-blue-700' },
};

function DecisionModal({
  item,
  onClose,
  onDecide,
}: {
  item: ReviewQueueItem;
  onClose: () => void;
  onDecide: (dto: DecideReviewDto) => Promise<void>;
}) {
  const [decision, setDecision] = useState<'approve' | 'reject' | 'reclassify'>('approve');
  const [note, setNote] = useState('');
  const [newCategoryCode, setNewCategoryCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setErr(null);
    try {
      await onDecide({
        decision,
        note: note || undefined,
        newCategoryCode: newCategoryCode || undefined,
      });
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-base font-semibold text-gray-900 mb-1">검토 결정</h3>
        <p className="text-sm text-gray-500 mb-4 truncate">{item.petition.title}</p>

        <div className="space-y-4">
          <div className="flex gap-2">
            {(['approve', 'reject', 'reclassify'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDecision(d)}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                  decision === d
                    ? d === 'approve'
                      ? 'bg-green-500 border-green-500 text-white'
                      : d === 'reject'
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {d === 'approve' ? '승인' : d === 'reject' ? '반려' : '재분류'}
              </button>
            ))}
          </div>

          {decision === 'reclassify' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                새 카테고리 코드
              </label>
              <input
                value={newCategoryCode}
                onChange={e => setNewCategoryCode(e.target.value)}
                placeholder="예: politics"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">메모 (선택)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="검토 메모..."
            />
          </div>

          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || (decision === 'reclassify' && !newCategoryCode)}
            className="flex-1 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? '처리 중...' : '결정'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewQueueTable() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'admin';
  const [statusFilter, setStatusFilter] = useState('');
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decidingItem, setDecidingItem] = useState<ReviewQueueItem | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load(status: string) {
    setLoading(true);
    adminApi
      .getReviewQueue(status || undefined)
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  async function handleAssign(id: string) {
    setAssigningId(id);
    try {
      await adminApi.assignReview(id);
      load(statusFilter);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAssigningId(null);
    }
  }

  async function handleDecide(dto: DecideReviewDto) {
    if (!decidingItem) return;
    await adminApi.decideReview(decidingItem.id, dto);
    load(statusFilter);
  }

  async function handleDelete(item: ReviewQueueItem) {
    if (!confirm(`"${item.petition.title}" 청원을 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.`)) return;
    setDeletingId(item.id);
    try {
      await adminApi.deleteFromQueue(item.id);
      load(statusFilter);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  const isPending = (item: ReviewQueueItem) => item.reviewStatus === 'pending';

  return (
    <>
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              statusFilter === tab.value
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
      ) : error ? (
        <p className="text-red-500 text-sm">오류: {error}</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 text-sm">해당 항목이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const badge = STATUS_BADGE[item.reviewStatus];
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {badge && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {item.petition.title}
                      </h3>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>
                        자동분류:{' '}
                        <span className="font-medium text-gray-700">
                          {item.latestClassificationResult?.primaryCategoryCode ?? '—'}
                        </span>
                        {item.latestClassificationResult && (
                          <span className="ml-1 text-gray-400">
                            ({Math.round(item.latestClassificationResult.confidence * 100)}%)
                          </span>
                        )}
                      </span>
                      <span>·</span>
                      <span>담당: {item.assignedModerator?.displayName ?? '미배정'}</span>
                      {!isPending(item) && item.reviewedBy && (
                        <>
                          <span>·</span>
                          <span>
                            처리자: <span className="font-medium text-gray-700">{item.reviewedBy.displayName ?? item.reviewedBy.id}</span>
                          </span>
                        </>
                      )}
                      {!isPending(item) && item.reviewedAt && (
                        <>
                          <span>·</span>
                          <span>{new Date(item.reviewedAt).toLocaleDateString('ko-KR')}</span>
                        </>
                      )}
                      {isPending(item) && (
                        <>
                          <span>·</span>
                          <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isPending(item) && (
                    <div className="flex gap-2 shrink-0">
                      {!item.assignedModerator && (
                        <button
                          onClick={() => handleAssign(item.id)}
                          disabled={assigningId === item.id}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          배정받기
                        </button>
                      )}
                      <button
                        onClick={() => setDecidingItem(item)}
                        className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700"
                      >
                        검토
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === item.id ? '삭제 중...' : '삭제'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {decidingItem && (
        <DecisionModal
          item={decidingItem}
          onClose={() => setDecidingItem(null)}
          onDecide={handleDecide}
        />
      )}
    </>
  );
}
