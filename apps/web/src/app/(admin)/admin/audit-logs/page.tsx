import type { Metadata } from 'next';
import { AuditLogsTable } from './_components/AuditLogsTable';

export const metadata: Metadata = { title: '감사 로그' };

export default function AuditLogsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">감사 로그</h1>
      <AuditLogsTable />
    </div>
  );
}
