import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-98765';

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Only run on dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role || 'user';

      // Block normal users from accessing dashboard
      if (role === 'user') {
        return NextResponse.redirect(new URL('/', req.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

