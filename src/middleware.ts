import { NextRequest, NextResponse } from 'next/server';

const protectedPages = ['/cart', '/orders'];
const protectedApi = ['/api/cart', '/api/orders'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtectedPage = protectedPages.some(p => pathname.startsWith(p));
  const isProtectedApi = protectedApi.some(p => pathname.startsWith(p));

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }
    if (isProtectedPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/orders/:path*', '/api/cart/:path*', '/api/orders/:path*'],
};
