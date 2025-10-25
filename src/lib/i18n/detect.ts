/**
 * Locale Detection
 * Accept-Language 헤더 파싱 및 사용자 locale 감지
 */

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './config';

/**
 * User-Agent에서 봇 여부 감지
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;

  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'crawling',
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest',
    'slackbot',
    'vkShare',
    'W3C_Validator',
  ];

  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some((pattern) => lowerUA.includes(pattern));
}

/**
 * Accept-Language 헤더 파싱
 * 예: "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" → [{locale: "ko", quality: 1.0}, ...]
 */
export function parseAcceptLanguage(
  acceptLanguage: string | null
): Array<{ locale: string; quality: number }> {
  if (!acceptLanguage) return [];

  const languages = acceptLanguage.split(',').map((lang) => {
    const [locale, q] = lang.trim().split(';');
    const quality = q ? parseFloat(q.split('=')[1]) : 1.0;

    // "ko-KR" → "ko", "zh-Hans-CN" → "zh-Hans"
    let normalizedLocale = locale.trim();

    // 특수 케이스: zh-Hans, zh-Hant, pt-BR 등
    if (normalizedLocale.startsWith('zh-Hans')) {
      normalizedLocale = 'zh-Hans';
    } else if (normalizedLocale.startsWith('pt-BR')) {
      normalizedLocale = 'pt-BR';
    } else {
      // 일반 케이스: "ko-KR" → "ko"
      normalizedLocale = normalizedLocale.split('-')[0];
    }

    return { locale: normalizedLocale, quality };
  });

  // quality 내림차순 정렬
  return languages.sort((a, b) => b.quality - a.quality);
}

/**
 * Accept-Language에서 지원하는 locale 찾기
 */
export function mapAcceptLanguageToSupported(
  acceptLanguage: string | null
): Locale | null {
  const languages = parseAcceptLanguage(acceptLanguage);

  for (const { locale } of languages) {
    // 정확히 일치하는 locale
    if (SUPPORTED_LOCALES.includes(locale as Locale)) {
      return locale as Locale;
    }

    // 언어 코드만 일치 (ko-KR → ko)
    const match = SUPPORTED_LOCALES.find((supported) =>
      supported.startsWith(locale)
    );
    if (match) return match;
  }

  return null;
}

/**
 * 사용자 선호 locale 감지
 * 우선순위: cookie > bot detection > Accept-Language > default
 */
export interface GetPreferredLocaleParams {
  cookieValue?: string | null;
  acceptLanguage?: string | null;
  userAgent?: string | null;
}

export function getPreferredLocale({
  cookieValue,
  acceptLanguage,
  userAgent,
}: GetPreferredLocaleParams): Locale {
  // 1. Cookie 값 확인
  if (cookieValue && SUPPORTED_LOCALES.includes(cookieValue as Locale)) {
    return cookieValue as Locale;
  }

  // 2. 봇이면 기본 locale (리다이렉트 방지)
  if (isBot(userAgent || null)) {
    return DEFAULT_LOCALE;
  }

  // 3. Accept-Language 헤더 파싱
  const detected = mapAcceptLanguageToSupported(acceptLanguage || null);
  if (detected) return detected;

  // 4. 기본값
  return DEFAULT_LOCALE;
}
