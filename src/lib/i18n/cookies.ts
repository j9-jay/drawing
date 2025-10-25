/**
 * Cookie Management
 * Locale 쿠키 관리
 */

import type { Locale } from './config';

export const LOCALE_COOKIE_NAME = 'locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180일 (초 단위)

/**
 * Locale 쿠키 설정
 * (클라이언트용)
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Locale 쿠키 읽기
 * (클라이언트용)
 */
export function getLocaleCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LOCALE_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * 서버 쿠키 헤더에서 locale 추출
 * (서버용 - middleware, layout)
 */
export function getLocaleFromCookieHeader(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LOCALE_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}
