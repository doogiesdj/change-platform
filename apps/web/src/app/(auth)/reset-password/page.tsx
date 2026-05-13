'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(token, password);
      router.push('/login?reset=1');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-red-600 text-sm mb-4">유효하지 않은 재설정 링크입니다.</p>
        <Link href="/forgot-password" className="text-primary-600 text-sm font-medium hover:underline">
          비밀번호 찾기로 다시 시도
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">새 비밀번호 설정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="8자 이상"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호 확인
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  );
}
