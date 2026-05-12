'use client';

import { useEffect, useState } from 'react';
import { adminApi, type DashboardPetitions } from '@/lib/api/admin';

const STATUS_LABEL: Record<string, string> = {
  review: '검토 중',
  published: '공개',
  rejected: '반려',
  closed: '종료',
  achieved: '달성',
};

export function PetitionsSection() {
  const [data, setData] = useState<DashboardPetitions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboardPetitions()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />;
  if (error) return <p className="text-red-500 text-sm">오류: {error}</p>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">상태별 청원</h3>
        {data.byStatus.length === 0 ? (
          <p className="text-xs text-gray-400">데이터 없음</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {data.byStatus.map(row => (
                <tr key={row.status} className="border-t border-gray-100 first:border-0">
                  <td className="py-1.5 text-gray-600">
                    {STATUS_LABEL[row.status] ?? row.status}
                  </td>
                  <td className="py-1.5 text-right font-medium text-gray-900">
                    {row.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">카테고리별 청원 (상위 10)</h3>
        {data.byCategory.length === 0 ? (
          <p className="text-xs text-gray-400">카테고리 데이터 없음</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {data.byCategory.map(row => (
                <tr key={row.categoryCode} className="border-t border-gray-100 first:border-0">
                  <td className="py-1.5 text-gray-600">{row.categoryCode}</td>
                  <td className="py-1.5 text-right font-medium text-gray-900">
                    {row.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
