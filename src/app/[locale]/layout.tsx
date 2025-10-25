/**
 * Locale Layout
 * 모든 locale 페이지의 공통 레이아웃
 * <html lang>, SEO 메타데이터, Navbar 포함
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { ToastProvider } from '@/components/ui';
import { JsonLd } from '@/components/seo';
import { type Locale, isValidLocale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { generatePageMetadata, generateWebPageSchema } from '@/lib/i18n/metadata';
import { loadTranslations, createTranslator } from '@/lib/i18n/translations';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * generateMetadata - 동적 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  // 번역 로드
  const commonTranslations = await loadTranslations(locale as Locale, 'common');
  const t = createTranslator(commonTranslations, locale as Locale);

  return generatePageMetadata({
    locale: locale as Locale,
    path: '/',
    title: t('siteName'),
    description: t('siteDescription'),
    type: 'website',
  });
}

/**
 * generateStaticParams - 정적 경로 생성 (빌드 시)
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }));
}

/**
 * LocaleLayout 컴포넌트
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Locale 유효성 검증
  if (!isValidLocale(locale)) {
    notFound();
  }

  // JSON-LD 스키마
  const commonTranslations = await loadTranslations(locale as Locale, 'common');
  const t = createTranslator(commonTranslations, locale as Locale);

  const webPageSchema = generateWebPageSchema({
    locale: locale as Locale,
    path: '/',
    title: t('siteName'),
    description: t('siteDescription'),
  });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <JsonLd data={webPageSchema} />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
