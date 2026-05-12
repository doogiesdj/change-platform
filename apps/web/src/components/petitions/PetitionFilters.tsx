'use client';

type SortOption = 'latest' | 'popular';

export const L1_CATEGORIES = [
  { code: 'GOV', label: '정부·정치' },
  { code: 'SOC', label: '사회·인권' },
  { code: 'EDU', label: '교육' },
  { code: 'HEL', label: '보건·복지' },
  { code: 'ENV', label: '환경·기후' },
  { code: 'ANI', label: '동물' },
  { code: 'LAB', label: '노동·경제·기업' },
  { code: 'JUS', label: '사법·안전' },
  { code: 'TEC', label: '기술·디지털' },
  { code: 'COM', label: '지역사회·생활' },
];

export const REGIONS = [
  { code: 'SEOUL', label: '서울' },
  { code: 'BUSAN', label: '부산' },
  { code: 'DAEGU', label: '대구' },
  { code: 'INCHEON', label: '인천' },
  { code: 'GWANGJU', label: '광주' },
  { code: 'DAEJEON', label: '대전' },
  { code: 'ULSAN', label: '울산' },
  { code: 'SEJONG', label: '세종' },
  { code: 'GYEONGGI', label: '경기' },
  { code: 'GANGWON', label: '강원' },
  { code: 'CHUNGBUK', label: '충북' },
  { code: 'CHUNGNAM', label: '충남' },
  { code: 'JEONBUK', label: '전북' },
  { code: 'JEONNAM', label: '전남' },
  { code: 'GYEONGBUK', label: '경북' },
  { code: 'GYEONGNAM', label: '경남' },
  { code: 'JEJU', label: '제주' },
];

interface Props {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  categoryCode?: string;
  onCategoryChange: (code: string | undefined) => void;
  regionCode?: string;
  onRegionChange: (code: string | undefined) => void;
  onResetFilters?: () => void;
}

export function PetitionFilters({
  sort,
  onSortChange,
  categoryCode,
  onCategoryChange,
  regionCode,
  onRegionChange,
  onResetFilters,
}: Props) {
  const hasActiveFilters = !!(categoryCode || regionCode);

  return (
    <div className="space-y-3">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(undefined)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            !categoryCode
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
          }`}
        >
          전체
        </button>
        {L1_CATEGORIES.map((cat) => (
          <button
            key={cat.code}
            onClick={() => onCategoryChange(cat.code === categoryCode ? undefined : cat.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              categoryCode === cat.code
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort + Region row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => onSortChange('latest')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sort === 'latest'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => onSortChange('popular')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sort === 'popular'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            인기순
          </button>
        </div>

        {/* Region filter */}
        <select
          value={regionCode ?? ''}
          onChange={(e) => onRegionChange(e.target.value || undefined)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">전국</option>
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-gray-400">적용된 필터:</span>
          {categoryCode && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              {L1_CATEGORIES.find((c) => c.code === categoryCode)?.label ?? categoryCode}
              <button
                type="button"
                onClick={() => onCategoryChange(undefined)}
                className="ml-0.5 hover:text-primary-900 font-bold leading-none"
                aria-label="카테고리 필터 해제"
              >
                ×
              </button>
            </span>
          )}
          {regionCode && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {REGIONS.find((r) => r.code === regionCode)?.label ?? regionCode}
              <button
                type="button"
                onClick={() => onRegionChange(undefined)}
                className="ml-0.5 hover:text-blue-900 font-bold leading-none"
                aria-label="지역 필터 해제"
              >
                ×
              </button>
            </span>
          )}
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              모두 초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
}
