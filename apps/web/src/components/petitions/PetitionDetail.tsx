'use client';

import { useQuery } from '@tanstack/react-query';
import { getPetition } from '@/lib/api/petitions';

interface Props {
  petitionId: string;
}

export function PetitionDetail({ petitionId }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['petition', petitionId],
    queryFn: () => getPetition(petitionId),
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>;
  }

  if (isError || !data) {
    return <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-red-600">청원을 불러올 수 없습니다.</p>
    </div>;
  }

  const petition = data.data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{petition.title}</h1>
      {petition.summary && (
        <p className="text-lg text-gray-600 mb-6">{petition.summary}</p>
      )}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        <span>{petition.signatureCountCached.toLocaleString()}명 서명</span>
        <span>상태: {petition.status}</span>
      </div>
      <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
        {petition.content}
      </div>
    </div>
  );
}
