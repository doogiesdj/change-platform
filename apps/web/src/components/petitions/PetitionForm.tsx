'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreatePetition } from '@/hooks/usePetitions';

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

export function PetitionForm() {
  const router = useRouter();
  const { mutate, isPending, error: mutationError } = useCreatePetition();

  const [values, setValues] = useState<FormState>({
    title: '',
    content: '',
    summary: '',
    regionCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

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
        regionCode: values.regionCode.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          router.push(`/petitions/${res.id}`);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="title"
        label="청원 제목"
        placeholder="청원의 핵심 내용을 간결하게 작성해주세요"
        value={values.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        maxLength={200}
      />

      <Textarea
        id="summary"
        label="요약 (선택)"
        placeholder="청원 내용을 한두 문장으로 요약해주세요 (최대 500자)"
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
        placeholder="청원의 배경, 문제 상황, 요구 사항을 구체적으로 작성해주세요"
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
        <div className="relative">
          <select
            id="regionCode"
            value={values.regionCode}
            onChange={(e) => handleChange('regionCode', e.target.value)}
            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white cursor-pointer"
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {mutationError && (
        <p className="text-sm text-red-600">
          {mutationError.message || '청원 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
      )}

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={isPending} size="lg" className="flex-1 md:flex-none md:min-w-40">
          {isPending ? '등록 중...' : '청원 제출하기'}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
