import { PetitionList } from '@/components/petitions/PetitionList';

export const metadata = { title: '청원 목록' };

export default function PetitionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">청원 목록</h1>
      <PetitionList />
    </div>
  );
}
