import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login'];
const protectedRoutes = ['/dashboard', '/onboarding'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from cookies (set by Supabase)
  const sessionCookie = request.cookies.get('sb-session');
  const isAuthenticated = !!sessionCookie?.value;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    // If user is authenticated and on login page, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect routes
  if (protectedRoutes.includes(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Root path
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
