import Link from 'next/link';
import type { PetitionListItem } from '@change/shared';
import { StatusBadge } from '@/components/ui/Badge';

const DEFAULT_TARGET = 5000;

const CATEGORY_LABELS: Record<string, string> = {
  GOV: '정부·정치',
  SOC: '사회·인권',
  EDU: '교육',
  HEL: '보건·복지',
  ENV: '환경·기후',
  ANI: '동물',
  LAB: '노동·경제·기업',
  JUS: '사법·안전',
  TEC: '기술·디지털',
  COM: '지역사회·생활',
  MIX: '복합이슈',
  UNC: '미분류',
  REV: '검토대기',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(iso),
  );
}

interface Props {
  petition: PetitionListItem;
}

export function PetitionCard({ petition }: Props) {
  const target = DEFAULT_TARGET;
  const progress = Math.min(Math.round((petition.signatureCount / target) * 100), 100);

  return (
    <Link href={`/petitions/${petition.id}`} className="block group">
      <article className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all h-full flex flex-col">
        <div className="flex items-start gap-2 mb-3">
          <StatusBadge status={petition.status} />
          {petition.primaryCategoryCode && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
              {CATEGORY_LABELS[petition.primaryCategoryCode] ?? petition.primaryCategoryCode}
            </span>
          )}
        </div>

        <h2 className="text-base font-semibold text-gray-900 group-hover:text-primary-700 line-clamp-2 mb-auto leading-snug">
          {petition.title}
        </h2>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-medium text-gray-900">
              {petition.signatureCount.toLocaleString()}명
            </span>
            <span className="text-gray-400 text-xs">목표 {target.toLocaleString()}명</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{formatDate(petition.createdAt)}</p>
        </div>
      </article>
    </Link>
  );
}
