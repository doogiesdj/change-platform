'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPetitions } from '@/lib/api/petitions';
import { adminApi } from '@/lib/api/admin';

const STATUS_OPTIONS = [
  { value: '', label: '전체 (공개 상태)' },
  { value: 'published', label: '공개' },
  { value: 'review', label: '검토 중' },
  { value: 'rejected', label: '반려' },
  { value: 'closed', label: '마감' },
  { value: 'achieved', label: '달성' },
];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: '공개', className: 'bg-green-100 text-green-700' },
  review: { label: '검토 중', className: 'bg-yellow-100 text-yellow-700' },
  rejected: { label: '반려', className: 'bg-red-100 text-red-700' },
  closed: { label: '마감', className: 'bg-gray-100 text-gray-600' },
  achieved: { label: '달성', className: 'bg-blue-100 text-blue-700' },
};

export default function AdminPetitionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'petitions', statusFilter],
    queryFn: () => getPetitions({ status: statusFilter || undefined, pageSize: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePetition(id),
    onSuccess: () => {
      toast.success('청원이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'petitions'] });
      setConfirmDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || '삭제 중 오류가 발생했습니다.');
      setConfirmDeleteId(null);
    },
  });

  const petitions = data?.items ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">청원 관리</h1>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">불러오는 중...</div>
      ) : petitions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">청원이 없습니다.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">제목</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 w-24">상태</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 w-24">서명 수</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 w-36">등록일</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {petitions.map((petition) => {
                const statusInfo = STATUS_LABELS[petition.status] ?? { label: petition.status, className: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={petition.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <a
                        href={`/petitions/${petition.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-primary-600 hover:underline line-clamp-1"
                      >
                        {petition.title}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {petition.signatureCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(petition.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {confirmDeleteId === petition.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(petition.id)}
                            disabled={deleteMutation.isPending}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(petition.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          삭제
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        * 삭제된 청원은 복구할 수 없습니다. 신중하게 사용해 주세요.
      </p>
    </div>
  );
}
