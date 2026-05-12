'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCreateSignature } from '@/hooks/useSignatures';

const REGION_OPTIONS = [
  { value: '', label: '선택 안함' },
  { value: 'SEOUL', label: '서울특별시' },
  { value: 'BUSAN', label: '부산광역시' },
  { value: 'DAEGU', label: '대구광역시' },
  { value: 'INCHEON', label: '인천광역시' },
  { value: 'GWANGJU', label: '광주광역시' },
  { value: 'DAEJEON', label: '대전광역시' },
  { value: 'ULSAN', label: '울산광역시' },
  { value: 'SEJONG', label: '세종특별자치시' },
  { value: 'GYEONGGI', label: '경기도' },
  { value: 'GANGWON', label: '강원특별자치도' },
  { value: 'CHUNGBUK', label: '충청북도' },
  { value: 'CHUNGNAM', label: '충청남도' },
  { value: 'JEONBUK', label: '전북특별자치도' },
  { value: 'JEONNAM', label: '전라남도' },
  { value: 'GYEONGBUK', label: '경상북도' },
  { value: 'GYEONGNAM', label: '경상남도' },
  { value: 'JEJU', label: '제주특별자치도' },
];

const AGE_BAND_OPTIONS = [
  { value: '', label: '선택 안함' },
  { value: 'under_19', label: '19세 이하' },
  { value: '20_29', label: '20대' },
  { value: '30_39', label: '30대' },
  { value: '40_49', label: '40대' },
  { value: '50_59', label: '50대' },
  { value: '60_plus', label: '60대 이상' },
  { value: 'unknown', label: '응답거부' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
  { value: 'unknown', label: '응답거부' },
];

interface FormState {
  displayName: string;
  ageBand: string;
  gender: string;
  regionCode: string;
  comment: string;
  consentToStatistics: boolean;
}

const INITIAL_STATE: FormState = {
  displayName: '',
  ageBand: '',
  gender: '',
  regionCode: '',
  comment: '',
  consentToStatistics: false,
};

interface FormErrors {
  displayName?: string;
  consentToStatistics?: string;
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.displayName.trim()) errors.displayName = '이름을 입력해주세요.';
  else if (values.displayName.trim().length > 50) errors.displayName = '이름은 최대 50자까지 입력할 수 있습니다.';
  if (!values.consentToStatistics) errors.consentToStatistics = '통계 활용 동의가 필요합니다.';
  return errors;
}

interface Props {
  petitionId: string;
}

export function SignatureForm({ petitionId }: Props) {
  const { user, isLoading: authLoading, isAuthenticated } = useCurrentUser();
  const { mutate, isPending, isSuccess, error } = useCreateSignature(petitionId);

  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const isDuplicateError = error?.message?.includes('이미 서명') ?? false;

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
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

    mutate({
      displayName: values.displayName.trim(),
      ageBand: values.ageBand || undefined,
      gender: values.gender || undefined,
      regionCode: values.regionCode.trim() || undefined,
      comment: values.comment.trim() || undefined,
      consentToStatistics: values.consentToStatistics,
    });
  }

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="mt-5 rounded-lg bg-gray-50 border border-gray-200 px-5 py-4 text-center">
        <p className="text-sm text-gray-600 mb-3">서명하려면 로그인이 필요합니다.</p>
        <Link
          href="/login"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (isSuccess || isDuplicateError) {
    return (
      <div
        className={`mt-5 rounded-lg px-5 py-4 text-center ${
          isDuplicateError ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'
        }`}
      >
        <p className={`text-sm font-medium ${isDuplicateError ? 'text-amber-700' : 'text-green-700'}`}>
          {isDuplicateError
            ? '이미 이 청원에 서명하셨습니다.'
            : '✓ 서명이 완료되었습니다. 참여해주셔서 감사합니다!'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-gray-100 pt-5">
      <p className="text-xs text-gray-500 -mb-1">
        수집한 정보는 청원 통계 산출 목적으로만 활용되며, 원시 데이터는 공개되지 않습니다.
      </p>

      <div>
        <label htmlFor="sig-displayName" className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="sig-displayName"
          type="text"
          value={values.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          placeholder={user?.displayName ?? '표시될 이름을 입력해주세요'}
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.displayName && <p className="mt-1 text-xs text-red-600">{errors.displayName}</p>}
      </div>

      <div>
        <label htmlFor="sig-ageBand" className="block text-sm font-medium text-gray-700 mb-1">
          연령대 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <select
          id="sig-ageBand"
          value={values.ageBand}
          onChange={(e) => handleChange('ageBand', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {AGE_BAND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          성별 <span className="text-gray-400 font-normal">(선택)</span>
        </span>
        <div className="flex flex-wrap gap-3">
          {GENDER_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="sig-gender"
                value={opt.value}
                checked={values.gender === opt.value}
                onChange={() => handleChange('gender', opt.value)}
                className="accent-primary-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="sig-regionCode" className="block text-sm font-medium text-gray-700 mb-1">
          지역 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <select
          id="sig-regionCode"
          value={values.regionCode}
          onChange={(e) => handleChange('regionCode', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {REGION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sig-comment" className="block text-sm font-medium text-gray-700 mb-1">
          한마디 <span className="text-gray-400 font-normal">(선택, 최대 300자)</span>
        </label>
        <textarea
          id="sig-comment"
          value={values.comment}
          onChange={(e) => handleChange('comment', e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="청원에 대한 짧은 응원 메시지를 남겨주세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={values.consentToStatistics}
            onChange={(e) => handleChange('consentToStatistics', e.target.checked)}
            className="mt-0.5 accent-primary-600"
          />
          <span className="text-sm text-gray-700">
            연령대·성별·지역 정보를 청원 통계 분석 목적으로 활용하는 것에 동의합니다.{' '}
            <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.consentToStatistics && (
          <p className="mt-1 text-xs text-red-600">{errors.consentToStatistics}</p>
        )}
      </div>

      {error && !isDuplicateError && (
        <p className="text-sm text-red-600">{error.message || '서명 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {isPending ? '서명 중...' : '이 청원에 서명하기'}
      </button>
    </form>
  );
}
