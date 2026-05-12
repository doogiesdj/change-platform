'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';

export function ReclassifyButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ total: number; success: number; failed: number } | null>(null);

  async function handleClick() {
    setStatus('running');
    setResult(null);
    try {
      const data = await apiClient.post<{ total: number; success: number; failed: number }>(
        '/admin/reclassify',
        {},
      );
      setResult(data);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleClick}
        disabled={status === 'running'}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'running' ? '분류 중...' : '전체 청원 재분류'}
      </button>
      {status === 'done' && result && (
        <span className="text-sm text-green-700">
          완료: {result.total}건 중 {result.success}건 성공
          {result.failed > 0 && `, ${result.failed}건 실패`}
        </span>
      )}
      {status === 'error' && (
        <span className="text-sm text-red-600">오류가 발생했습니다. 로그인 상태를 확인하세요.</span>
      )}
    </div>
  );
}
