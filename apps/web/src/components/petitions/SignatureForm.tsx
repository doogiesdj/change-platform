'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  petitionId: string;
}

export function SignatureForm({ petitionId }: Props) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [consent, setConsent] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/petitions/${petitionId}/signatures`, {
        displayName,
        consentToStatistics: consent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition', petitionId] });
      setDisplayName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-50 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">서명하기</h3>
      <Input
        label="표시 이름"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="청원서에 표시될 이름"
        required
      />
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="rounded"
        />
        통계 목적으로 정보 수집에 동의합니다
      </label>
      <Button type="submit" disabled={mutation.isPending || !displayName.trim()}>
        {mutation.isPending ? '서명 중...' : '서명하기'}
      </Button>
      {mutation.isError && (
        <p className="text-sm text-red-600">서명에 실패했습니다. 다시 시도해 주세요.</p>
      )}
      {mutation.isSuccess && (
        <p className="text-sm text-green-600">서명이 완료되었습니다!</p>
      )}
    </form>
  );
}
