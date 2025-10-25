/**
 * Translation Loader
 * JSON 번역 파일 로드 및 키 접근
 */

import type { Locale } from './config';
import { getFallbackLocale } from './config';

type TranslationKeys = Record<string, string | TranslationKeys>;

const translationCache = new Map<string, TranslationKeys>();

/**
 * 번역 파일 로드 (서버 컴포넌트용)
 * @param locale - 로드할 locale
 * @param namespace - 번역 네임스페이스 (common, nav, pages)
 */
export async function loadTranslations(
  locale: Locale,
  namespace: string = 'common'
): Promise<TranslationKeys> {
  const cacheKey = `${locale}-${namespace}`;

  // 캐시 확인
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    // 동적 import로 번역 파일 로드
    const translations = await import(
      `@/../locales/${locale}/${namespace}.json`
    );
    translationCache.set(cacheKey, translations.default);
    return translations.default;
  } catch (error) {
    // fallback locale 시도
    const fallbackLocale = getFallbackLocale(locale);
    if (fallbackLocale !== locale) {
      try {
        const fallbackTranslations = await import(
          `@/../locales/${fallbackLocale}/${namespace}.json`
        );
        return fallbackTranslations.default;
      } catch {
        console.warn(
          `Translation file not found: ${locale}/${namespace}.json and fallback failed`
        );
        return {};
      }
    }

    console.warn(`Translation file not found: ${locale}/${namespace}.json`);
    return {};
  }
}

/**
 * 중첩 키 접근 (예: "header.title")
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
 * 번역 함수 생성 (서버 컴포넌트용)
 */
export function createTranslator(
  translations: TranslationKeys,
  locale: Locale
) {
  return function t(key: string, fallback?: string): string {
    const value = getNestedValue(translations, key);
    if (value !== undefined) return value;

    console.warn(`Translation missing: ${locale}.${key}`);
    return fallback || key;
  };
}

/**
 * 간편한 번역 함수 (async)
 */
export async function getTranslation(
  locale: Locale,
  namespace: string,
  key: string,
  fallback?: string
): Promise<string> {
  const translations = await loadTranslations(locale, namespace);
  const t = createTranslator(translations, locale);
  return t(key, fallback);
}
