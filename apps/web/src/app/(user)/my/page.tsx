'use client';

import Link from 'next/link';
import type { Metadata } from 'next';
import { useMyPetitions } from '@/hooks/usePetitions';
import { StatusBadge } from '@/components/ui/Badge';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(iso),
  );
}

export default function MyPage() {
  const { data, isLoading, isError } = useMyPetitions();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">마이페이지</h1>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">내가 만든 청원</h2>
          <Link
            href="/petitions/new"
            className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            새 청원 만들기
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-red-600 text-sm">청원 목록을 불러올 수 없습니다.</p>
        )}

        {data && data.items.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">아직 작성한 청원이 없습니다.</p>
            <Link
              href="/petitions/new"
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              첫 번째 청원을 시작해보세요 →
            </Link>
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
            {data.items.map((petition) => (
              <div key={petition.id} className="flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={petition.status} />
                    <span className="text-xs text-gray-400">{formatDate(petition.createdAt)}</span>
                  </div>
                  <Link
                    href={`/petitions/${petition.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-700 truncate block transition-colors"
                  >
                    {petition.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    서명 {petition.signatureCount.toLocaleString()}명
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/petitions/${petition.id}`}
                    className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    보기
                  </Link>
                  <Link
                    href={`/petitions/${petition.id}/edit`}
                    className="text-xs px-3 py-1.5 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    수정
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
