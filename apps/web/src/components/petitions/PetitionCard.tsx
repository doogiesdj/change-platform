import Link from 'next/link';
import type { PetitionListItem } from '@change/shared';

interface Props {
  petition: PetitionListItem;
}

export function PetitionCard({ petition }: Props) {
  const progress = Math.min(
    Math.round((petition.signatureCountCached / 5000) * 100),
    100,
  );

  return (
    <Link href={`/petitions/${petition.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 line-clamp-2 mb-3">
          {petition.title}
        </h2>
        {petition.summary && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{petition.summary}</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{petition.signatureCountCached.toLocaleString()}명 서명</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
