import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n/config';

/**
 * Detects the preferred locale from the Accept-Language header.
 * Returns the best matching supported locale, or the default.
 */
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header into weighted locale preferences
  // Format: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7"
  const preferred = acceptLanguage
    .split(',')
    .map((entry) => {
      const [locale, qValue] = entry.trim().split(';q=');
      return {
        locale: locale.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the first supported locale that matches
  for (const { locale } of preferred) {
    // Exact match (e.g., "en" or "de")
    const exact = locales.find((l) => l === locale);
    if (exact) return exact;

    // Prefix match (e.g., "en-US" -> "en", "de-DE" -> "de")
    const prefix = locale.split('-')[0];
    const prefixMatch = locales.find((l) => l === prefix);
    if (prefixMatch) return prefixMatch;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already includes a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Detect locale and redirect
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all paths except static assets and metadata files
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.webp$|.*\\.ico$).*)',
  ],
};
