import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 只保护 /admin 路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('需要认证', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="管理员区域"',
        },
      });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [, password] = credentials.split(':');

    if (!process.env.ADMIN_PASSWORD) {
      return new NextResponse('管理员密码未配置', { status: 500 });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return new NextResponse('密码错误', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="管理员区域"',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 