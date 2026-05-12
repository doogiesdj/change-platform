import { PetitionList } from '@/components/petitions/PetitionList';

export const metadata = { title: '청원 목록 | Change' };

export default function PetitionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="py-10 border-b border-gray-200 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">청원 목록</h1>
        <p className="text-gray-500 text-base">
          시민들이 제안한 청원을 확인하고, 공감하는 청원에 서명해주세요.
        </p>
      </div>
      <div className="pb-16">
        <PetitionList />
      </div>
    </div>
  );
}
