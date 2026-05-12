'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

interface Props {
  petitionId: string;
}

interface IntentResponse {
  donationId: string;
  amount: number;
}

const PRESET_AMOUNTS = [5000, 10000, 30000, 50000];

type Step = 'select' | 'method' | 'payment' | 'done';
type PaymentMethod = 'card' | 'bank_transfer' | 'toss';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string; description: string }[] = [
  { value: 'toss', label: '토스', icon: '🔵', description: '토스 앱으로 간편하게 결제합니다.' },
  { value: 'card', label: '신용·체크카드', icon: '💳', description: '카드 번호를 입력해 결제합니다.' },
  { value: 'bank_transfer', label: '계좌이체', icon: '🏦', description: '가상계좌로 입금합니다.' },
];

export function DonationForm({ petitionId }: Props) {
  const [amount, setAmount] = useState<number>(10000);
  const [step, setStep] = useState<Step>('select');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [donationId, setDonationId] = useState<string | null>(null);
  const [tossLaunched, setTossLaunched] = useState(false);

  const intentMutation = useMutation({
    mutationFn: () =>
      apiClient.post<IntentResponse>('/donations/intent', {
        targetType: 'petition',
        petitionId,
        amount,
        donationType: 'one_time',
      }),
    onSuccess: (data) => {
      setDonationId(data.donationId);
      setStep('payment');
    },
    onError: (err: Error) => {
      toast.error(err.message || '결제 준비 중 오류가 발생했습니다.');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => apiClient.post(`/donations/confirm/${donationId}`, { amount }),
    onSuccess: () => {
      setStep('done');
    },
    onError: (err: Error) => {
      toast.error(err.message || '결제 처리 중 오류가 발생했습니다.');
    },
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    return digits;
  };

  if (step === 'done') {
    return (
      <div className="p-6 bg-green-50 rounded-xl border border-green-200">
        <p className="text-base font-semibold text-green-800">후원이 완료되었습니다!</p>
        <p className="text-sm text-green-600 mt-1">{amount.toLocaleString()}원 후원해 주셔서 감사합니다.</p>
      </div>
    );
  }

  if (step === 'payment' && paymentMethod === 'bank_transfer') {
    return (
      <div className="space-y-4 p-6 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('method')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← 뒤로
          </button>
          <h3 className="text-lg font-semibold text-gray-900">계좌이체</h3>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">입금 금액</span>
            <span className="font-bold text-primary-700">{amount.toLocaleString()}원</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">은행</span>
            <span className="font-medium text-gray-900">국민은행</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">가상계좌</span>
            <span className="font-mono font-medium text-gray-900">123-456-789012</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">예금주</span>
            <span className="font-medium text-gray-900">(주)체인지</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          위 가상계좌로 입금 후 아래 버튼을 눌러주세요. 입금 확인 후 후원이 처리됩니다.
        </p>
        <p className="text-xs text-gray-400">* 테스트 결제입니다. 실제 입금하지 마세요.</p>

        <Button
          type="button"
          onClick={() => confirmMutation.mutate()}
          disabled={confirmMutation.isPending}
          className="w-full"
        >
          {confirmMutation.isPending ? '확인 중...' : '입금 완료'}
        </Button>
      </div>
    );
  }

  if (step === 'payment' && paymentMethod === 'toss') {
    if (tossLaunched) {
      const tossQrValue = `supertoss://send?bank=국민은행&accountNo=123456789012&amount=${amount}&origin=Change청원플랫폼`;

      return (
        <div className="space-y-4 p-6 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTossLaunched(false)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              ← 뒤로
            </button>
            <h3 className="text-lg font-semibold text-gray-900">토스 QR 결제</h3>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">결제 금액</span>
            <span className="text-base font-bold text-primary-700">{amount.toLocaleString()}원</span>
          </div>

          <div className="flex flex-col items-center gap-4 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3182F6' }}>
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">토스로 스캔하여 결제</span>
            </div>

            <div className="p-3 border-2 border-gray-100 rounded-xl">
              <QRCode
                value={tossQrValue}
                size={180}
                fgColor="#1A1A2E"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">토스 앱 → 하단 스캐너 → QR 스캔</p>
              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 text-left space-y-0.5">
                <p><span className="text-gray-500 font-medium">은행</span> 국민은행</p>
                <p><span className="text-gray-500 font-medium">계좌</span> 123-456-789012</p>
                <p><span className="text-gray-500 font-medium">예금주</span> (주)체인지</p>
              </div>
            </div>

            <p className="text-xs text-gray-400">* 테스트 결제입니다. 실제 결제가 발생하지 않습니다.</p>
          </div>

          <Button
            type="button"
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending}
            className="w-full !bg-[#3182F6] hover:!bg-[#1B64DA]"
          >
            {confirmMutation.isPending ? '확인 중...' : '결제 완료했습니다'}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-6 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('method')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← 뒤로
          </button>
          <h3 className="text-lg font-semibold text-gray-900">토스 결제</h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">결제 금액</span>
          <span className="text-base font-bold text-primary-700">{amount.toLocaleString()}원</span>
        </div>

        <div className="flex flex-col items-center gap-3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#3182F6' }}>
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <p className="text-sm text-gray-700 text-center">
            아래 버튼을 누르면 토스 앱이 열립니다.<br />
            토스 앱에서 결제를 완료해 주세요.
          </p>
          <p className="text-xs text-gray-400">* 테스트 결제입니다. 실제 결제가 발생하지 않습니다.</p>
        </div>

        <Button
          type="button"
          onClick={() => setTossLaunched(true)}
          className="w-full !bg-[#3182F6] hover:!bg-[#1B64DA]"
        >
          {`토스로 ${amount.toLocaleString()}원 결제하기`}
        </Button>
      </div>
    );
  }

  if (step === 'payment' && paymentMethod === 'card') {
    const isPayable = cardNumber.replace(/\s/g, '').length === 16 && expiry.length >= 4 && cvc.length >= 3;
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); confirmMutation.mutate(); }}
        className="space-y-4 p-6 bg-blue-50 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('method')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← 뒤로
          </button>
          <h3 className="text-lg font-semibold text-gray-900">카드 결제</h3>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">결제 금액</span>
          <span className="text-base font-bold text-primary-700">{amount.toLocaleString()}원</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">카드 번호</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 tracking-widest"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">유효기간</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">CVC</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">* 테스트 결제입니다. 실제 카드 정보를 입력하지 마세요.</p>
        <Button type="submit" disabled={confirmMutation.isPending || !isPayable} className="w-full">
          {confirmMutation.isPending ? '결제 처리 중...' : `${amount.toLocaleString()}원 결제하기`}
        </Button>
      </form>
    );
  }

  if (step === 'method') {
    return (
      <div className="space-y-4 p-6 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('select')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← 뒤로
          </button>
          <h3 className="text-lg font-semibold text-gray-900">결제 방법 선택</h3>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">후원 금액</span>
          <span className="text-base font-bold text-primary-700">{amount.toLocaleString()}원</span>
        </div>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                paymentMethod === method.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${paymentMethod === method.value ? 'text-primary-700' : 'text-gray-900'}`}>
                  {method.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
              </div>
              {paymentMethod === method.value && (
                <span className="ml-auto text-primary-600 text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        <Button
          type="button"
          onClick={() => intentMutation.mutate()}
          disabled={intentMutation.isPending}
          className="w-full"
        >
          {intentMutation.isPending ? '준비 중...' : '다음'}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setStep('method'); }}
      className="space-y-4 p-6 bg-blue-50 rounded-xl"
    >
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
      <Button type="submit" disabled={amount < 1000}>
        다음 — {amount.toLocaleString()}원
      </Button>
    </form>
  );
}
