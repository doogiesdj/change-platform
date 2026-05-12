'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePetition, usePetitionUpdates, useCreatePetitionUpdate } from '@/hooks/usePetitions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { SignatureForm } from './SignatureForm';
import { DonationForm } from './DonationForm';

const DEFAULT_TARGET = 5000;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(iso),
  );
}

function PetitionUpdatesSection({ petitionId, authorId }: { petitionId: string; authorId: string }) {
  const { user, isAuthenticated } = useCurrentUser();
  const { data: updates, isLoading } = usePetitionUpdates(petitionId);
  const { mutate, isPending } = useCreatePetitionUpdate(petitionId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const isAuthor = isAuthenticated && user?.id === authorId;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setFormError('내용을 입력해주세요.'); return; }
    setFormError('');
    mutate(
      { title: title.trim() || undefined, content: content.trim() },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setShowForm(false);
        },
      },
    );
  }

  if (isLoading) return null;
  if (!updates || (updates.length === 0 && !isAuthor)) return null;

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">청원 업데이트</h2>
        {isAuthor && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            + 업데이트 작성
          </button>
        )}
      </div>

      {isAuthor && showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="제목 (선택)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
          <textarea
            placeholder="업데이트 내용을 작성해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={5000}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white"
          />
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? '등록 중...' : '업데이트 등록'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setTitle(''); setContent(''); setFormError(''); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {updates && updates.length > 0 && (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                {update.title && (
                  <h3 className="text-sm font-semibold text-gray-900">{update.title}</h3>
                )}
                <span className="text-xs text-gray-400 ml-auto">{formatDate(update.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{update.content}</p>
            </div>
          ))}
        </div>
      )}

      {updates && updates.length === 0 && isAuthor && (
        <p className="text-sm text-gray-400">아직 업데이트가 없습니다.</p>
      )}
    </div>
  );
}

interface Props {
  petitionId: string;
}

export function PetitionDetail({ petitionId }: Props) {
  const { data, isLoading, isError } = usePetition(petitionId);
  const { user, isAuthenticated } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-20 mb-6" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-24 bg-gray-100 rounded-xl mt-8" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-600">청원을 불러올 수 없습니다.</p>
      </div>
    );
  }

  const petition = data;
  const target = petition.targetSignatureCount ?? DEFAULT_TARGET;
  const progress = Math.min(Math.round((petition.signatureCount / target) * 100), 100);
  const isAuthor = isAuthenticated && user?.id === petition.authorId;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/petitions"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← 청원 목록으로
        </Link>
        {isAuthor && (
          <Link
            href={`/petitions/${petition.id}/edit`}
            className="text-sm font-medium px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            청원 수정
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <StatusBadge status={petition.status} />
        {petition.categories.map((cat) => (
          <Badge key={cat.code} variant={cat.isPrimary ? 'indigo' : 'gray'}>
            {cat.label}
          </Badge>
        ))}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-5">
        {petition.title}
      </h1>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
        <span>작성자: {petition.author.displayName}</span>
        <span>등록일: {formatDate(petition.createdAt)}</span>
        {petition.publishedAt && <span>공개일: {formatDate(petition.publishedAt)}</span>}
        {petition.regionCode && <span>지역: {petition.regionCode}</span>}
        {petition.decisionMaker && <span>담당 기관: {petition.decisionMaker.name}</span>}
      </div>

      {petition.summary && (
        <div className="bg-blue-50 border-l-4 border-primary-500 rounded-r-lg px-5 py-4 mb-8">
          <p className="text-sm font-medium text-primary-800 mb-1">요약</p>
          <p className="text-gray-700 leading-relaxed">{petition.summary}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              {petition.signatureCount.toLocaleString()}
            </span>
            <span className="text-gray-500 ml-1 text-sm">명 서명</span>
          </div>
          <span className="text-sm text-gray-400">목표 {target.toLocaleString()}명</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{progress}% 달성</p>

        {petition.status === 'published' && <SignatureForm petitionId={petition.id} />}
      </div>

      {petition.status === 'published' && (
        <div className="mb-8">
          <DonationForm petitionId={petition.id} />
        </div>
      )}

      <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
        {petition.content}
      </div>

      <PetitionUpdatesSection petitionId={petition.id} authorId={petition.authorId} />
    </div>
  );
}
