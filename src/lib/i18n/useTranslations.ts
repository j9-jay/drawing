/**
 * Client-side Translation Hook
 * 클라이언트 컴포넌트에서 번역 사용
 */

'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isValidLocale, getFallbackLocale, type Locale } from './config';
import { useTranslationsCache } from './TranslationsProvider';

type TranslationKeys = Record<string, string | TranslationKeys>;

/**
 * 중첩 키 접근 (예: "pinball.game.controls.title")
 */
function getNestedValue(
  obj: TranslationKeys,
  path: string
): string | undefined {
  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * 클라이언트 측 번역 훅
 * @param namespace - 번역 네임스페이스 (common, nav, pages)
 */
export function useTranslations(namespace: string = 'pages') {
  const pathname = usePathname();
  const { getCache, setCache } = useTranslationsCache();
  const [translations, setTranslations] = useState<TranslationKeys>({});
  const [isLoading, setIsLoading] = useState(true);

  // pathname에서 locale 추출
  const pathSegments = pathname.split('/').filter(Boolean);
  const maybeLocale = pathSegments[0];
  const locale = isValidLocale(maybeLocale) ? (maybeLocale as Locale) : 'en';

  useEffect(() => {
    async function loadTranslations() {
      // 먼저 캐시 확인
      const cached = getCache(locale, namespace);
      if (cached) {
        setTranslations(cached);
        setIsLoading(false);
        return;
      }

      // 캐시에 없으면 로드
      setIsLoading(true);
      try {
        // 동적 import로 번역 파일 로드
        const data = await import(
          `@/../locales/${locale}/${namespace}.json`
        );
        const translationsData = data.default || data;
        setTranslations(translationsData);
        // 캐시에 저장
        setCache(locale, namespace, translationsData);
      } catch (error) {
        // fallback locale 시도
        const fallbackLocale = getFallbackLocale(locale);
        if (fallbackLocale !== locale) {
          try {
            const fallbackData = await import(
              `@/../locales/${fallbackLocale}/${namespace}.json`
            );
            const translationsData = fallbackData.default || fallbackData;
            setTranslations(translationsData);
            setCache(locale, namespace, translationsData);
          } catch {
            console.warn(
              `Translation file not found: ${locale}/${namespace}.json and fallback failed`
            );
            setTranslations({});
          }
        } else {
          console.warn(`Translation file not found: ${locale}/${namespace}.json`);
          setTranslations({});
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTranslations();
  }, [locale, namespace, getCache, setCache]);

  /**
   * 번역 함수
   * @param key - 번역 키 (예: "pinball.game.controls.title")
   * @param fallback - 키가 없을 때 반환할 기본값
   */
  function t(key: string, fallback?: string): string {
    const value = getNestedValue(translations, key);
    if (value !== undefined) return value;

    if (process.env.NODE_ENV === 'development') {
      console.warn(`Translation missing: ${locale}.${namespace}.${key}`);
    }
    return fallback || key;
  }

  return { t, locale, isLoading };
}
