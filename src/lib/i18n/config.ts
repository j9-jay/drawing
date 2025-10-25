/**
 * i18n Configuration
 * 다국어 지원 설정 및 locale 매핑
 */

export const SUPPORTED_LOCALES = [
  'en',
  'ko',
  'ja',
  'zh-Hans',
  'es',
  'fr',
  'de',
  'pt-BR',
  'ru',
  'it',
  'id',
  'tr',
  'vi',
  'th',
  'hi',
  'ar',
  'nl',
  'pl',
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Locale 표시 이름
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  'zh-Hans': '简体中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  'pt-BR': 'Português (BR)',
  ru: 'Русский',
  it: 'Italiano',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  hi: 'हिन्दी',
  ar: 'العربية',
  nl: 'Nederlands',
  pl: 'Polski',
};

/**
 * Locale fallback 맵
 * 번역 파일이 없는 경우 대체 locale
 */
export const LOCALE_FALLBACKS: Record<string, Locale> = {
  // 번역 완료된 언어는 자기 자신으로
  ko: 'ko',
  en: 'en',

  // 미번역 언어는 영어로 fallback
  ja: 'en',
  'zh-Hans': 'en',
  es: 'en',
  fr: 'en',
  de: 'en',
  'pt-BR': 'en',
  ru: 'en',
  it: 'en',
  id: 'en',
  tr: 'en',
  vi: 'en',
  th: 'en',
  hi: 'en',
  ar: 'en',
  nl: 'en',
  pl: 'en',
};

/**
 * Open Graph locale 형식 매핑
 */
export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  ko: 'ko_KR',
  ja: 'ja_JP',
  'zh-Hans': 'zh_CN',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  'pt-BR': 'pt_BR',
  ru: 'ru_RU',
  it: 'it_IT',
  id: 'id_ID',
  tr: 'tr_TR',
  vi: 'vi_VN',
  th: 'th_TH',
  hi: 'hi_IN',
  ar: 'ar_AR',
  nl: 'nl_NL',
  pl: 'pl_PL',
};

/**
 * Locale 유효성 검증
 */
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Fallback locale 반환
 */
export function getFallbackLocale(locale: string): Locale {
  return LOCALE_FALLBACKS[locale] || DEFAULT_LOCALE;
}
