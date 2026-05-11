import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          당신의 목소리로 변화를 만드세요
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          청원을 작성하고, 서명하고, 함께 변화를 이끌어보세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/petitions"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            청원 둘러보기
          </Link>
          <Link
            href="/petitions/new"
            className="px-8 py-3 border border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            청원 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
