/**
 * Dynamic Sitemap Generation
 * Locale-aware sitemap with alternate links
 */

import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

// 사이트의 모든 경로 정의
const routes = [
  '/',
  '/about',
  '/pinball',
  '/pinball/editor',
  '/roulette',
  '/components',
];

export default async function sitemap({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { locale } = await params;

  return routes.map((route) => {
    // 각 경로에 대해 모든 locale의 alternate 링크 생성
    const alternates = {
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((loc) => [
          loc,
          `${SITE_URL}/${loc}${route === '/' ? '' : route}`,
        ])
      ),
    };

    return {
      url: `${SITE_URL}/${locale}${route === '/' ? '' : route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 1.0 : 0.8,
      alternates,
    };
  });
}
