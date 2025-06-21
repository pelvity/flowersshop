import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@config/i18n';
import { NextRequest, NextResponse } from 'next/server';

// Create a wrapper to add logging
const nextIntlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
  
  // Always add locale prefix, even for default locale
  // This ensures consistent behavior and prevents issues with undefined locales
  localePrefix: 'always',
  
  // Enable automatic locale detection
  localeDetection: true
});

// Add logging wrapper
export default function middleware(request: NextRequest) {
  console.log(`[MIDDLEWARE] Request URL: ${request.url}`);
  console.log(`[MIDDLEWARE] Pathname: ${request.nextUrl.pathname}`);
  
  const pathname = request.nextUrl.pathname;
  
  // Check if this is a direct access to a route without locale prefix
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Special handling for cart/checkout path
  if (pathname.startsWith('/cart/checkout')) {
    console.log(`[MIDDLEWARE] Fixing cart/checkout path`);
    const url = new URL(`/${defaultLocale}/checkout`, request.url);
    console.log(`[MIDDLEWARE] Redirecting to: ${url.toString()}`);
    return NextResponse.redirect(url);
  }
  
  if (!pathnameHasLocale && pathname !== '/') {
    // This is a direct access to a route without locale, like /products
    console.log(`[MIDDLEWARE] Direct access to route without locale: ${pathname}`);
    
    // Redirect to the localized version using the default locale
    const url = new URL(`/${defaultLocale}${pathname}`, request.url);
    console.log(`[MIDDLEWARE] Redirecting to: ${url.toString()}`);
    return NextResponse.redirect(url);
  }
  
  const response = nextIntlMiddleware(request);
  
  // Log any redirects
  if (response.headers.get('Location')) {
    console.log(`[MIDDLEWARE] Redirecting to: ${response.headers.get('Location')}`);
  }
  
  return response;
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)', '/']
}; 