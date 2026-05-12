import type { Metadata } from 'next';
import { PetitionForm } from '@/components/petitions/PetitionForm';

export const metadata: Metadata = { title: '청원 작성 | Change' };

export default function NewPetitionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">새 청원 작성</h1>
        <p className="text-gray-500 text-sm">
          청원이 등록되면 운영자 검토 후 공개됩니다.
        </p>
      </div>
      <PetitionForm />
    </div>
  );
}
