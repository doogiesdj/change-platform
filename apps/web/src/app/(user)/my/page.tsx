import type { Metadata } from 'next';

export const metadata: Metadata = { title: '마이페이지' };

export default function MyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">마이페이지</h1>
      <p className="text-gray-500">나의 청원, 서명, 후원 내역이 여기에 표시됩니다.</p>
    </div>
  );
}
