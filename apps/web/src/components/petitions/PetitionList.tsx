'use client';

import { useState } from 'react';
import { usePetitions } from '@/hooks/usePetitions';
import { PetitionCard } from './PetitionCard';
import { PetitionFilters, L1_CATEGORIES, REGIONS } from './PetitionFilters';

type SortOption = 'latest' | 'popular';

export function PetitionList() {
  const [sort, setSort] = useState<SortOption>('latest');
  const [page, setPage] = useState(1);
  const [categoryCode, setCategoryCode] = useState<string | undefined>();
  const [regionCode, setRegionCode] = useState<string | undefined>();

  const { data, isLoading, isError } = usePetitions({ sort, page, pageSize: 12, categoryCode, regionCode });

  const items = data?.items ?? [];
  const meta = data?.meta;

  function handleSortChange(s: SortOption) {
    setSort(s);
    setPage(1);
  }

  function handleCategoryChange(code: string | undefined) {
    setCategoryCode(code);
    setPage(1);
  }

  function handleRegionChange(code: string | undefined) {
    setRegionCode(code);
    setPage(1);
  }

  function handleResetFilters() {
    setCategoryCode(undefined);
    setRegionCode(undefined);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PetitionFilters
        sort={sort}
        onSortChange={handleSortChange}
        categoryCode={categoryCode}
        onCategoryChange={handleCategoryChange}
        regionCode={regionCode}
        onRegionChange={handleRegionChange}
        onResetFilters={handleResetFilters}
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-red-600 py-4">청원 목록을 불러오는 데 실패했습니다.</p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="py-16 text-center">
          {categoryCode || regionCode ? (
            <>
              <p className="text-gray-500 text-lg">조건에 맞는 청원이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-1">
                {[
                  categoryCode && `카테고리: ${L1_CATEGORIES.find((c) => c.code === categoryCode)?.label ?? categoryCode}`,
                  regionCode && `지역: ${REGIONS.find((r) => r.code === regionCode)?.label ?? regionCode}`,
                ]
                  .filter(Boolean)
                  .join(' / ')}
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                필터 초기화
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-lg">표시할 청원이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-1">아직 등록된 청원이 없습니다.</p>
            </>
          )}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((petition) => (
            <PetitionCard key={petition.id} petition={petition} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-500">
            {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= meta.totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
