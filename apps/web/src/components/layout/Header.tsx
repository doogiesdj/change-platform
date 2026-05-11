import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-700">
          Change
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/petitions" className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors">
            청원
          </Link>
          <Link href="/petitions/new" className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors">
            청원 시작하기
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
