import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Only SECURITY_SUPERVISOR can access /admin/users or /admin/settings
    if (pathname.startsWith('/admin') && token.role !== 'SECURITY_SUPERVISOR') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname === '/login' || pathname.startsWith('/api/auth')) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/custodian/:path*',
    '/inventory/:path*',
    '/add/:path*',
    '/bookings/:path*',
    '/categories/:path*',
    '/issue/:path*',
    '/return/:path*',
    '/active/:path*',
    '/records/:path*',
    '/reports/:path*',
    '/audit/:path*',
    '/bulk-operations/:path*',
    '/admin/:path*',
    '/guards/:path*',
  ],
};
