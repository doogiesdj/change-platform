'use client';

import { useEffect, useState } from 'react';
import { adminApi, type AdminUser } from '@/lib/api/admin';

const ROLE_LABELS: Record<string, string> = {
  guest: '게스트',
  user: '일반 유저',
  petition_creator: '청원 작성자',
  moderator: '모더레이터',
  admin: '관리자',
};

const STATUS_LABELS: Record<string, string> = {
  active: '활성',
  suspended: '정지',
  deleted: '삭제',
};

const ROLES = ['user', 'petition_creator', 'moderator', 'admin'] as const;

const LIMIT = 20;

export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getUsers(page, LIMIT)
      .then(res => {
        setUsers(res.data);
        setTotal(res.total);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleRoleChange(userId: string, role: string) {
    setUpdatingId(userId);
    try {
      const updated = await adminApi.updateUserRole(userId, role);
      setUsers(prev =>
        prev.map(u => (u.id === updated.id ? { ...u, role: updated.role } : u)),
      );
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />;
  if (error) return <p className="text-red-500 text-sm">오류: {error}</p>;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">전체 {total.toLocaleString()}명</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">이메일</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">닉네임</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">역할</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">상태</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">가입일</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">역할 변경</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{user.email}</td>
                <td className="py-3 px-4 text-gray-600">{user.displayName ?? '—'}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : user.status === 'suspended'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {STATUS_LABELS[user.status] ?? user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingId === user.id}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 disabled:opacity-50"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
          >
            이전
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
