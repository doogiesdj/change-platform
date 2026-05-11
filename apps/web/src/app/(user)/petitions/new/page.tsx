import type { Metadata } from 'next';

export const metadata: Metadata = { title: '청원 작성' };

export default function NewPetitionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">새 청원 작성</h1>
      <p className="text-gray-500">청원 작성 폼이 여기에 표시됩니다.</p>
    </div>
  );
}
