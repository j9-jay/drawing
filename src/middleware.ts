/**
 * Next.js Middleware
 * Locale 감지 및 리다이렉트 처리
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from './lib/i18n/config';
import { getPreferredLocale } from './lib/i18n/detect';
import { getLocaleFromCookieHeader, LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from './lib/i18n/cookies';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일, API, Next.js 내부 경로는 건너뛰기
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // 파일 확장자 포함 (이미지, 폰트 등)
  ) {
    return NextResponse.next();
  }

  // 경로에서 locale 추출 (예: /ko/about → ko)
  const pathSegments = pathname.split('/').filter(Boolean);
  const maybeLocale = pathSegments[0];

  // Case 1: 유효한 locale이 이미 경로에 포함된 경우
  if (maybeLocale && isValidLocale(maybeLocale)) {
    // 쿠키에 현재 locale 저장 (선택 유지)
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE_NAME, maybeLocale, {
      path: '/',
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
    return response;
  }

  // Case 2: 잘못된 locale이 경로에 포함된 경우 (예: /xyz/about)
  // → /en/{나머지 경로}로 리다이렉트
  if (maybeLocale && SUPPORTED_LOCALES.every(loc => loc !== maybeLocale)) {
    // locale이 아닌 경로인지 확인 (예: /about, /pinball 등)
    // 이 경우 Case 3로 처리
    const validPages = ['about', 'pinball', 'roulette', 'components'];
    if (!validPages.includes(maybeLocale)) {
      // 잘못된 locale → 기본 locale로 리다이렉트
      const newPath = `/${DEFAULT_LOCALE}/${pathSegments.join('/')}`;
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      return NextResponse.redirect(url, 302);
    }
  }

  // Case 3: locale이 경로에 없는 경우 (예: /, /about, /pinball)
  // → locale 감지하여 /{locale}{pathname}으로 리다이렉트

  const cookieValue = getLocaleFromCookieHeader(request.headers.get('cookie'));
  const acceptLanguage = request.headers.get('accept-language');
  const userAgent = request.headers.get('user-agent');

  const preferredLocale = getPreferredLocale({
    cookieValue,
    acceptLanguage,
    userAgent,
  });

  // 리다이렉트 URL 생성
  const newPath = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;
  const url = request.nextUrl.clone();
  url.pathname = newPath;

  const response = NextResponse.redirect(url, 302);

  // 쿠키 설정 (선택 유지)
  response.cookies.set(LOCALE_COOKIE_NAME, preferredLocale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  // 모든 경로에 대해 middleware 실행 (정적 파일 제외)
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)' ,
  ],
};
