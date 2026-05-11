'use client';

import { usePetitions } from '@/hooks/usePetitions';
import { PetitionCard } from './PetitionCard';

export function PetitionList() {
  const { data, isLoading, isError } = usePetitions();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-600">청원 목록을 불러오는 데 실패했습니다.</p>;
  }

  if (!data?.data.length) {
    return <p className="text-gray-500">표시할 청원이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.data.map((petition) => (
        <PetitionCard key={petition.id} petition={petition} />
      ))}
    </div>
  );
}
