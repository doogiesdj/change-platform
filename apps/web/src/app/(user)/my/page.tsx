'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMyPetitions } from '@/hooks/usePetitions';
import { StatusBadge } from '@/components/ui/Badge';
import { changePassword, deleteAccount } from '@/lib/api/auth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(iso),
  );
}

function ChangePasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await changePassword(current, next);
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">비밀번호 변경</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
          <input
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
          <input
            type="password"
            value={next}
            onChange={e => setNext(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </section>
  );
}

function DeleteAccountSection() {
  const { logout } = useCurrentUser();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await deleteAccount();
      logout();
      router.push('/');
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-red-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">회원 탈퇴</h2>
      <p className="text-sm text-gray-500 mb-4">
        탈퇴 시 계정 정보가 비활성화되며, 작성하신 청원과 서명 기록은 보존됩니다.
      </p>
      {error && (
        <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          회원 탈퇴
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-600 font-medium">정말로 탈퇴하시겠습니까?</p>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '처리 중...' : '확인, 탈퇴합니다'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      )}
    </section>
  );
}

export default function MyPage() {
  const { data, isLoading, isError } = useMyPetitions();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">내가 만든 청원</h2>
          <Link
            href="/petitions/new"
            className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            새 청원 만들기
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-red-600 text-sm">청원 목록을 불러올 수 없습니다.</p>
        )}

        {data && data.items.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">아직 작성한 청원이 없습니다.</p>
            <Link
              href="/petitions/new"
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              첫 번째 청원을 시작해보세요 →
            </Link>
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
            {data.items.map((petition) => (
              <div key={petition.id} className="flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={petition.status} />
                    <span className="text-xs text-gray-400">{formatDate(petition.createdAt)}</span>
                  </div>
                  <Link
                    href={`/petitions/${petition.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-700 truncate block transition-colors"
                  >
                    {petition.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    서명 {petition.signatureCount.toLocaleString()}명
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/petitions/${petition.id}`}
                    className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    보기
                  </Link>
                  <Link
                    href={`/petitions/${petition.id}/edit`}
                    className="text-xs px-3 py-1.5 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    수정
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ChangePasswordSection />
      <DeleteAccountSection />
    </div>
  );
}
