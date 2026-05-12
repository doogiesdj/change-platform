'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { usePetition, useUpdatePetition } from '@/hooks/usePetitions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface FormState {
  title: string;
  content: string;
  summary: string;
  regionCode: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  summary?: string;
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (values.title.trim().length < 5) errors.title = '제목은 최소 5자 이상이어야 합니다.';
  if (values.title.trim().length > 200) errors.title = '제목은 최대 200자까지 입력할 수 있습니다.';
  if (values.content.trim().length < 20) errors.content = '본문은 최소 20자 이상이어야 합니다.';
  if (values.content.trim().length > 10000) errors.content = '본문은 최대 10,000자까지 입력할 수 있습니다.';
  if (values.summary.trim().length > 500) errors.summary = '요약은 최대 500자까지 입력할 수 있습니다.';
  return errors;
}

export default function EditPetitionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated } = useCurrentUser();
  const { data: petition, isLoading } = usePetition(id);
  const { mutate, isPending, error: mutationError } = useUpdatePetition(id);

  const [values, setValues] = useState<FormState>({ title: '', content: '', summary: '', regionCode: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (petition && !initialized) {
      setValues({
        title: petition.title ?? '',
        content: petition.content ?? '',
        summary: petition.summary ?? '',
        regionCode: petition.regionCode ?? '',
      });
      setInitialized(true);
    }
  }, [petition, initialized]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-red-600">청원을 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (isAuthenticated && user && petition.authorId !== user.id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-red-600">수정 권한이 없습니다.</p>
      </div>
    );
  }

  function handleChange(field: keyof FormState, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (submitted) {
      setErrors(validate({ ...values, [field]: value }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    mutate(
      {
        title: values.title.trim(),
        content: values.content.trim(),
        summary: values.summary.trim() || undefined,
        regionCode: values.regionCode || undefined,
      },
      {
        onSuccess: () => {
          router.push(`/petitions/${id}`);
        },
      },
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/petitions/${id}`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        ← 청원으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">청원 수정</h1>
      <p className="text-sm text-gray-500 mb-8">수정 후 검토 대기 상태로 변경됩니다.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="title"
          label="청원 제목"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          maxLength={200}
        />

        <Textarea
          id="summary"
          label="요약 (선택)"
          value={values.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          rows={3}
          maxLength={500}
          hint="목록 화면에서 청원 내용을 미리 보여줄 때 사용됩니다."
          error={errors.summary}
        />

        <Textarea
          id="content"
          label="청원 본문"
          value={values.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={12}
          maxLength={10000}
          error={errors.content}
        />

        <div>
          <label htmlFor="regionCode" className="block text-sm font-medium text-gray-700 mb-1">
            지역 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <select
            id="regionCode"
            value={values.regionCode}
            onChange={(e) => handleChange('regionCode', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="">전국 (지역 무관)</option>
            <option value="SEOUL">서울특별시</option>
            <option value="BUSAN">부산광역시</option>
            <option value="DAEGU">대구광역시</option>
            <option value="INCHEON">인천광역시</option>
            <option value="GWANGJU">광주광역시</option>
            <option value="DAEJEON">대전광역시</option>
            <option value="ULSAN">울산광역시</option>
            <option value="SEJONG">세종특별자치시</option>
            <option value="GYEONGGI">경기도</option>
            <option value="GANGWON">강원특별자치도</option>
            <option value="CHUNGBUK">충청북도</option>
            <option value="CHUNGNAM">충청남도</option>
            <option value="JEONBUK">전북특별자치도</option>
            <option value="JEONNAM">전라남도</option>
            <option value="GYEONGBUK">경상북도</option>
            <option value="GYEONGNAM">경상남도</option>
            <option value="JEJU">제주특별자치도</option>
          </select>
        </div>

        {mutationError && (
          <p className="text-sm text-red-600">
            {mutationError.message || '수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" disabled={isPending} size="lg" className="flex-1 md:flex-none md:min-w-40">
            {isPending ? '저장 중...' : '수정 저장하기'}
          </Button>
          <button
            type="button"
            onClick={() => router.push(`/petitions/${id}`)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
