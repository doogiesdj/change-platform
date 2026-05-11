'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

interface Props {
  petitionId: string;
}

const PRESET_AMOUNTS = [5000, 10000, 30000, 50000];

export function DonationForm({ petitionId }: Props) {
  const [amount, setAmount] = useState<number>(10000);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post('/donations', {
        targetType: 'petition',
        targetId: petitionId,
        amount,
        donationType: 'one_time',
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-blue-50 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">후원하기</h3>
      <div className="flex gap-2 flex-wrap">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(preset)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              amount === preset
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-700 hover:border-primary-400'
            }`}
          >
            {preset.toLocaleString()}원
          </button>
        ))}
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        min={1000}
        step={1000}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <Button type="submit" disabled={mutation.isPending || amount < 1000}>
        {mutation.isPending ? '처리 중...' : `${amount.toLocaleString()}원 후원하기`}
      </Button>
      {mutation.isSuccess && (
        <p className="text-sm text-green-600">후원 신청이 완료되었습니다!</p>
      )}
    </form>
  );
}
