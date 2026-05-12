'use client';

import { useEffect, useState } from 'react';
import { adminApi, type DashboardDonations } from '@/lib/api/admin';

function formatAmount(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

const TARGET_TYPE_LABEL: Record<string, string> = {
  petition: '청원 후원',
  platform: '플랫폼 후원',
};

export function DonationsSection() {
  const [data, setData] = useState<DashboardDonations | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboardDonations()
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
        <h3 className="text-sm font-semibold text-gray-700 mb-4">후원 현황</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">총 후원액</span>
            <span className="font-bold text-gray-900">{formatAmount(data.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">최근 30일</span>
            <span className="font-semibold text-gray-700">{formatAmount(data.recentTotal)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">유형별 후원</h3>
        {data.byTargetType.length === 0 ? (
          <p className="text-xs text-gray-400">후원 데이터 없음</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {data.byTargetType.map(row => (
                <tr key={row.targetType} className="border-t border-gray-100 first:border-0">
                  <td className="py-1.5 text-gray-600">
                    {TARGET_TYPE_LABEL[row.targetType] ?? row.targetType}
                  </td>
                  <td className="py-1.5 text-right text-gray-500">
                    {row.count.toLocaleString()}건
                  </td>
                  <td className="py-1.5 text-right font-medium text-gray-900">
                    {formatAmount(row.amount)}
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
