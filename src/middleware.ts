import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 只保护 /admin 路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 让客户端组件处理认证
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 