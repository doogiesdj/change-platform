'use client';

import { useEffect, useState } from 'react';
import { adminApi, type DashboardSignatures } from '@/lib/api/admin';

export function SignaturesSection() {
  const [data, setData] = useState<DashboardSignatures | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboardSignatures()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />;
  if (error) return <p className="text-red-500 text-sm">오류: {error}</p>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatTable
        title="지역별"
        rows={data.byRegion.map(r => ({ label: r.region, value: r.count }))}
        emptyText="지역 동의 데이터 없음"
      />
      <StatTable
        title="연령대별"
        rows={data.byAgeBand.map(r => ({ label: r.ageBand, value: r.count }))}
        emptyText="연령 동의 데이터 없음"
      />
      <StatTable
        title="성별"
        rows={data.byGender.map(r => ({ label: r.gender, value: r.count }))}
        emptyText="성별 동의 데이터 없음"
      />
    </div>
  );
}

function StatTable({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: { label: string; value: number }[];
  emptyText: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400">{emptyText}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {rows.map(row => (
              <tr key={row.label} className="border-t border-gray-100 first:border-0">
                <td className="py-1.5 text-gray-600">{row.label}</td>
                <td className="py-1.5 text-right font-medium text-gray-900">
                  {row.value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
