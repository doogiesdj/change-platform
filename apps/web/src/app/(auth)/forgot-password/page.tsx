'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h1>
        <p className="text-sm text-gray-500 mb-6">
          {email}으로 비밀번호 재설정 링크를 발송했습니다.<br />
          이메일이 오지 않으면 스팸함을 확인해주세요.
        </p>
        <Link href="/login" className="text-sm text-primary-600 font-medium hover:underline">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">비밀번호 찾기</h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        가입한 이메일 주소를 입력하시면 재설정 링크를 보내드립니다.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="가입한 이메일 주소"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '전송 중...' : '재설정 링크 보내기'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-primary-600 font-medium hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
