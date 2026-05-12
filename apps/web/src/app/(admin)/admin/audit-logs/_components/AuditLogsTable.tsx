'use client';

import { useEffect, useState } from 'react';
import { adminApi, type AuditLog } from '@/lib/api/admin';

const LIMIT = 50;

const ACTION_COLORS: Record<string, string> = {
  user_role_update: 'bg-blue-50 text-blue-700',
  review_assign: 'bg-yellow-50 text-yellow-700',
  review_decide: 'bg-green-50 text-green-700',
  petition_status_change: 'bg-purple-50 text-purple-700',
};

export function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getAuditLogs(page, LIMIT)
      .then(data => {
        setLogs(data);
        setHasMore(data.length === LIMIT);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />;
  if (error) return <p className="text-red-500 text-sm">오류: {error}</p>;

  if (logs.length === 0 && page === 1) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-500 text-sm">감사 로그가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                시각
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">작업자</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">액션</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">대상</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">메모</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="py-3 px-4 text-gray-900">
                  {log.actor?.displayName ?? '—'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      ACTION_COLORS[log.actionType] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {log.actionType}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {log.targetType}
                  {log.targetId && (
                    <span className="ml-1 text-gray-400 font-mono text-xs">
                      {log.targetId.slice(0, 8)}…
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                  {log.metadataJson?.note as string | undefined ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
        >
          이전
        </button>
        <span className="px-3 py-1.5 text-sm text-gray-600">페이지 {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
