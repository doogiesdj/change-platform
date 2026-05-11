import type { Metadata } from 'next';

export const metadata: Metadata = { title: '관리자 대시보드' };

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 대시보드</h1>
      <p className="text-gray-500">통계, 사용자 관리, 검토 큐가 여기에 표시됩니다.</p>
    </div>
  );
}
