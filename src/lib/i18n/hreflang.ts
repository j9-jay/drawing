/**
 * Hreflang Generation
 * SEO를 위한 alternate links 생성
 */

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './config';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/**
 * 현재 경로에 대한 모든 locale의 alternate links 생성
 * @param currentPath - locale이 제거된 경로 (예: "/about", "/pinball")
 * @param siteUrl - 사이트 기본 URL (예: "https://yourdomain.com")
 * @returns AlternateLink 배열 (x-default 포함)
 */
export function buildAlternateLinks(
  currentPath: string,
  siteUrl: string
): AlternateLink[] {
  // 경로가 "/"로 시작하지 않으면 추가
  const normalizedPath = currentPath.startsWith('/')
    ? currentPath
    : `/${currentPath}`;

  const links: AlternateLink[] = [];

  // 모든 지원 locale에 대한 링크
  for (const locale of SUPPORTED_LOCALES) {
    links.push({
      hreflang: locale,
      href: `${siteUrl}/${locale}${normalizedPath}`,
    });
  }

  // x-default (기본 locale)
  links.push({
    hreflang: 'x-default',
    href: `${siteUrl}/${DEFAULT_LOCALE}${normalizedPath}`,
  });

  return links;
}

/**
 * 현재 locale을 제외한 alternate links 생성
 * (og:locale:alternate용)
 */
export function buildAlternateLocales(currentLocale: Locale): Locale[] {
  return SUPPORTED_LOCALES.filter((locale) => locale !== currentLocale);
}
