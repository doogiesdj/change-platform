'use client';

import { useEffect, useState, useCallback } from 'react';
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
const STATUSES = ['', 'active', 'suspended', 'deleted'] as const;
const LIMIT = 20;

export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminApi
      .getUsers(page, LIMIT, search || undefined, filterRole || undefined, filterStatus || undefined)
      .then(res => {
        setUsers(res.data);
        setTotal(res.total);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, search, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  async function handleStatusChange(userId: string, status: 'active' | 'suspended' | 'deleted') {
    const labels: Record<string, string> = { suspended: '정지', deleted: '삭제', active: '활성화' };
    if (!confirm(`이 사용자를 ${labels[status]}처리하시겠습니까?`)) return;

    setUpdatingId(userId);
    try {
      const updated = await adminApi.updateUserStatus(userId, status);
      setUsers(prev =>
        prev.map(u => (u.id === updated.id ? { ...u, status: updated.status } : u)),
      );
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="이메일 또는 닉네임 검색"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">모든 역할</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s ? STATUS_LABELS[s] : '모든 상태'}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">전체 {total.toLocaleString()}명</p>

      {loading && <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}
      {error && <p className="text-red-500 text-sm">오류: {error}</p>}

      {!loading && !error && (
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
                <th className="py-3 px-4 text-left font-semibold text-gray-700">상태 변경</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className={`border-t border-gray-100 hover:bg-gray-50 ${user.status === 'deleted' ? 'opacity-50' : ''}`}
                >
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
                      disabled={updatingId === user.id || user.status === 'deleted'}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 disabled:opacity-50"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          disabled={updatingId === user.id}
                          className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 disabled:opacity-50"
                        >
                          정지
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          disabled={updatingId === user.id}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50"
                        >
                          활성화
                        </button>
                      )}
                      {user.status !== 'deleted' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'deleted')}
                          disabled={updatingId === user.id}
                          className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                    사용자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
