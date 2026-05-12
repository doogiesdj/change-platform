'use client';

import { useEffect, useState } from 'react';
import { adminApi, type DashboardOverview } from '@/lib/api/admin';
import { KpiCard } from './KpiCard';

function formatAmount(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

export function OverviewSection() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboardOverview()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <OverviewSkeleton />;
  if (error) return <p className="text-red-500 text-sm">오류: {error}</p>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <KpiCard
        label="전체 유저"
        value={data.totalUsers.toLocaleString()}
        href="/admin/users"
      />
      <KpiCard
        label="전체 청원"
        value={data.totalPetitions.toLocaleString()}
        href="/admin/petitions"
      />
      <KpiCard
        label="공개 청원"
        value={data.publishedPetitions.toLocaleString()}
        description="published 상태"
        href="/admin/petitions"
      />
      <KpiCard
        label="검토 대기"
        value={data.pendingReviewPetitions.toLocaleString()}
        description="Review Queue pending"
        href="/admin/review-queue"
      />
      <KpiCard
        label="전체 서명"
        value={data.totalSignatures.toLocaleString()}
        href="/admin#signatures"
      />
      <KpiCard
        label="후원 총액"
        value={formatAmount(data.totalDonationAmount)}
        description="성공 결제 기준"
        href="/admin#donations"
      />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
