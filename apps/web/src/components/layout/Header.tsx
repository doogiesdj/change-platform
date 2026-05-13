'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function Header() {
  const { user, isLoading, isAuthenticated, logout } = useCurrentUser();

  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

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
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/my"
                className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors"
              >
                {user.displayName}
              </Link>
              {isAdminOrMod && (
                <Link
                  href="/admin"
                  className="text-sm font-medium px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                >
                  관리 대시보드
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm font-medium px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/admin/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                관리자
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                로그인
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
