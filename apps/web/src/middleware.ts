import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER_PROTECTED = ['/my', '/petitions/new'];
const ADMIN_ROOT = '/admin';
const ADMIN_LOGIN = '/admin/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (USER_PROTECTED.some((path) => pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(ADMIN_ROOT) && pathname !== ADMIN_LOGIN) {
    if (!token) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
