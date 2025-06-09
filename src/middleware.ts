import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '../config/i18n';

export function middleware(request: NextRequest) {
  // Log API requests with enhanced details
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const path = request.nextUrl.pathname;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    
    console.log(`[${timestamp}] [MIDDLEWARE] API ${method} ${path}`, {
      query: Object.keys(query).length ? query : 'none',
      contentType: request.headers.get('content-type'),
      hasAuth: !!request.headers.get('authorization'),
      referer: request.headers.get('referer') || 'none'
    });
  }

  const pathname = request.nextUrl.pathname;
  
  // Skip public files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/')
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale: string) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Default to the default locale
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 