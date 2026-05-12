import type { Metadata } from 'next';
import { UsersTable } from './_components/UsersTable';

export const metadata: Metadata = { title: '유저 관리' };

export default function UsersPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">유저 관리</h1>
      <UsersTable />
    </div>
  );
}
