'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin', label: '대시보드', exact: true },
  { href: '/admin/users', label: '유저 관리', exact: false },
  { href: '/admin/petitions', label: '청원 관리', exact: false },
  { href: '/admin/review-queue', label: '검토 큐', exact: false },
  { href: '/admin/audit-logs', label: '감사 로그', exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-6">
          <span className="text-sm font-bold text-gray-900 shrink-0">Admin</span>
          <div className="flex gap-1">
            {NAV_LINKS.map(link => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
