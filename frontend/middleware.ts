import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login'];
const protectedRoutes = ['/dashboard', '/onboarding'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for custom JWT token in cookies (set after OTP verification)
  const token = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!token;

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
