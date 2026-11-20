import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'stayzy_session_token';

// Lightweight payload decoder for Next.js Edge Runtime
function parseJwtPayload(token: string): { payload: any; isExpired: boolean } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const jsonStr = Buffer.from(parts[1], 'base64url').toString('utf8');
    const decoded = JSON.parse(jsonStr);
    const nowSec = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < nowSec) {
      return { payload: decoded, isExpired: true };
    }
    return { payload: decoded, isExpired: false };
  } catch {
    return null;
  }
}

function applyNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass public static assets, api routes, and root landing
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const parsed = token ? parseJwtPayload(token) : null;
  const isExpired = parsed?.isExpired || false;
  const session = parsed && !parsed.isExpired ? parsed.payload : null;

  // 1. ADMIN PORTAL ACCESS CONTROL (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Allow admin login page
    if (pathname === '/admin/login') {
      // If already logged in as staff, redirect directly to dashboard
      if (session && ['ADMIN', 'OPS', 'SUPPORT'].includes(session.role)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Require valid staff session
    if (!session || !['ADMIN', 'OPS', 'SUPPORT'].includes(session.role)) {
      const loginUrl = new URL('/admin/login', request.url);
      if (isExpired) {
        loginUrl.searchParams.set('expired', 'true');
      } else {
        loginUrl.searchParams.set('redirect', pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      return applyNoCacheHeaders(response);
    }

    const response = NextResponse.next();
    return applyNoCacheHeaders(response);
  }

  // 2. PG OWNER PORTAL ACCESS CONTROL (/owner/*)
  if (pathname.startsWith('/owner')) {
    // Allow owner login page
    if (pathname === '/owner/login') {
      if (session && session.role === 'OWNER') {
        return NextResponse.redirect(new URL('/owner/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Require valid owner session
    if (!session || session.role !== 'OWNER') {
      const loginUrl = new URL('/owner/login', request.url);
      if (isExpired) {
        loginUrl.searchParams.set('expired', 'true');
      } else {
        loginUrl.searchParams.set('redirect', pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      return applyNoCacheHeaders(response);
    }

    const response = NextResponse.next();
    return applyNoCacheHeaders(response);
  }

  // 3. CUSTOMER PORTAL ACCESS CONTROL (/customer/*)
  if (pathname.startsWith('/customer')) {
    // Public customer discovery routes
    if (
      pathname === '/customer' ||
      pathname === '/customer/explore' ||
      pathname === '/customer/search' ||
      pathname.startsWith('/customer/pg')
    ) {
      return NextResponse.next();
    }

    // Customer login route
    if (pathname === '/customer/login') {
      if (session && session.role === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/customer/explore', request.url));
      }
      return NextResponse.next();
    }

    // Protected customer routes (account, checkout, stays, visits, booking, profile-setup)
    if (
      pathname.startsWith('/customer/checkout') ||
      pathname.startsWith('/customer/stays') ||
      pathname.startsWith('/customer/account') ||
      pathname.startsWith('/customer/visits') ||
      pathname.startsWith('/customer/booking') ||
      pathname.startsWith('/customer/payments') ||
      pathname.startsWith('/customer/support') ||
      pathname === '/customer/profile-setup'
    ) {
      if (!session) {
        const loginUrl = new URL('/customer/login', request.url);
        if (isExpired) {
          loginUrl.searchParams.set('expired', 'true');
        } else {
          loginUrl.searchParams.set('redirect', pathname);
        }
        const response = NextResponse.redirect(loginUrl);
        return applyNoCacheHeaders(response);
      }
    }

    const response = NextResponse.next();
    return applyNoCacheHeaders(response);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
