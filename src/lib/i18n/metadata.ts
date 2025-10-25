/**
 * Metadata Generation Helpers
 * SEO 메타데이터 생성 유틸리티
 */

import type { Metadata } from 'next';
import type { Locale } from './config';
import {
  OG_LOCALE_MAP,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_NAMES,
} from './config';
import { buildAlternateLinks, buildAlternateLocales } from './hreflang';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export interface PageMetadataParams {
  locale: Locale;
  path: string; // locale 제외한 경로 (예: "/about", "/pinball")
  title: string;
  description: string;
  keywords?: string[];
  type?: 'website' | 'article';
  images?: string[];
}

/**
 * 페이지 메타데이터 생성
 */
export function generatePageMetadata({
  locale,
  path,
  title,
  description,
  keywords = [],
  type = 'website',
  images = [],
}: PageMetadataParams): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const currentUrl = `${SITE_URL}/${locale}${normalizedPath}`;
  const canonicalUrl = currentUrl;

  // Alternate links (hreflang)
  const alternates = buildAlternateLinks(normalizedPath, SITE_URL);
  const alternateLocales = buildAlternateLocales(locale);

  // Open Graph locale
  const ogLocale = OG_LOCALE_MAP[locale];
  const ogLocaleAlternates = alternateLocales.map((loc) => OG_LOCALE_MAP[loc]);

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        alternates
          .filter((alt) => alt.hreflang !== 'x-default')
          .map((alt) => [alt.hreflang, alt.href])
      ),
    },
    openGraph: {
      type,
      locale: ogLocale,
      alternateLocale: ogLocaleAlternates,
      url: currentUrl,
      title,
      description,
      siteName: 'Easy-Picky',
      images: images.length > 0 ? images : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? images : undefined,
    },
  };
}

/**
 * JSON-LD 스키마 생성 (WebPage)
 */
export function generateWebPageSchema({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const currentUrl = `${SITE_URL}/${locale}${normalizedPath}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: currentUrl,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Easy-Picky',
      url: SITE_URL,
    },
  };
}

/**
 * JSON-LD 스키마 생성 (BreadcrumbList)
 */
export function generateBreadcrumbSchema({
  locale,
  items,
}: {
  locale: Locale;
  items: Array<{ name: string; path: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${locale}${item.path}`,
    })),
  };
}
