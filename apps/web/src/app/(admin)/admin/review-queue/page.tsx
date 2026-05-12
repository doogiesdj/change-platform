import type { Metadata } from 'next';
import { ReviewQueueTable } from './_components/ReviewQueueTable';

export const metadata: Metadata = { title: '검토 큐' };

export default function ReviewQueuePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">검토 큐</h1>
      <ReviewQueueTable />
    </div>
  );
}
