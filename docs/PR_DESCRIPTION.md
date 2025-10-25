# 다국어 SEO 최적화 아키텍처 구현

## 📋 개요

Next.js App Router 기반 18개 언어 지원 다국어 SEO 최적화 구조를 구축했습니다.

### 주요 변경사항

- **URL 구조**: 모든 페이지가 `/{locale}/...` 형식으로 변경
- **언어 지원**: 18개 언어 설정 (번역: ko, en / 설정: 16개 추가)
- **SEO 최적화**: hreflang, canonical, Open Graph, JSON-LD 완벽 구현
- **자동 언어 감지**: Accept-Language 헤더 + 쿠키 기반

---

## 🔄 URL 변경사항

### Before
```
/
/about
/pinball
/pinball/editor
/roulette
/components
```

### After
```
/ → /{detected-locale}/ (자동 리다이렉트)
/{locale}/about
/{locale}/pinball
/{locale}/pinball/editor
/{locale}/roulette
/{locale}/components
```

**예시**:
- 한국어: `/ko/about`, `/ko/pinball`
- 영어: `/en/about`, `/en/pinball`
- 일본어: `/ja/about`, `/ja/pinball` (영어 fallback)

---

## 🌐 지원 언어

### 번역 완료 (2개)
- **ko** (한국어) - 전체 번역
- **en** (영어) - 전체 번역

### 설정 완료 (16개 - 영어 fallback)
ja, zh-Hans, es, fr, de, pt-BR, ru, it, id, tr, vi, th, hi, ar, nl, pl

---

## 🎯 언어 감지 로직

### 우선순위
1. **Cookie** `locale` 값 (180일 유효)
2. **봇 감지** → DEFAULT_LOCALE (en)
3. **Accept-Language** 헤더 파싱 → 지원 언어 매핑
4. **기본값** → en

### 리다이렉트 정책
- `/` 접속 시: 감지된 locale으로 302 리다이렉트
- 잘못된 locale: `/en/{path}`로 302 리다이렉트
- 봇: 리다이렉트 없음 (SEO 최적화)

---

## 🔍 SEO 구현

### 모든 페이지에 적용

#### 1. HTML lang 속성
```html
<html lang="ko">
```

#### 2. Canonical Link
```html
<link rel="canonical" href="https://yourdomain.com/ko/about" />
```

#### 3. Hreflang (18개 + x-default)
```html
<link rel="alternate" hreflang="ko" href="https://yourdomain.com/ko/about" />
<link rel="alternate" hreflang="en" href="https://yourdomain.com/en/about" />
<link rel="alternate" hreflang="ja" href="https://yourdomain.com/ja/about" />
... (18개)
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/en/about" />
```

#### 4. Open Graph Meta
```html
<meta property="og:locale" content="ko_KR" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:locale:alternate" content="ja_JP" />
... (17개)
```

#### 5. JSON-LD Structured Data
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "inLanguage": "ko",
  ...
}
</script>
```

### Sitemap
- 각 locale마다 동적 sitemap 생성
- `<xhtml:link rel="alternate">` 포함
- 접근: `/{locale}/sitemap.xml`

---

## 🗂️ 파일 구조 변경

### 신규 생성 파일

#### i18n 인프라 (6개)
```
src/lib/i18n/
├── config.ts          # 18개 locale, fallback 설정
├── detect.ts          # 언어 감지, 봇 감지
├── hreflang.ts        # alternate links 생성
├── cookies.ts         # 쿠키 관리
├── translations.ts    # 번역 로더
└── metadata.ts        # SEO 메타데이터 헬퍼
```

#### 번역 파일 (6개)
```
locales/
├── ko/
│   ├── common.json
│   ├── nav.json
│   └── pages.json
└── en/
    ├── common.json
    ├── nav.json
    └── pages.json
```

#### 컴포넌트 (3개)
```
src/components/
├── seo/
│   ├── JsonLd.tsx
│   └── index.ts
└── LanguageSwitcher.tsx
```

#### 라우팅 (2개)
```
src/
├── middleware.ts
└── app/[locale]/
    └── layout.tsx
```

### 마이그레이션 파일

#### 페이지 이동 (6개)
```
app/page.tsx            → app/[locale]/page.tsx
app/about/page.tsx      → app/[locale]/about/page.tsx
app/pinball/page.tsx    → app/[locale]/pinball/page.tsx
app/pinball/editor/page.tsx → app/[locale]/pinball/editor/page.tsx
app/roulette/page.tsx   → app/[locale]/roulette/page.tsx
app/components/page.tsx → app/[locale]/components/page.tsx
```

#### 수정 파일 (3개)
- `app/layout.tsx` - locale-agnostic으로 간소화
- `components/layout/Navbar.tsx` - LanguageSwitcher 통합
- `next.config.ts` - trailingSlash: false 설정

### 총 파일 수
- **신규**: ~20개
- **마이그레이션**: 6개
- **수정**: 3개
- **총**: ~29개

---

## 🎨 언어 전환기 (LanguageSwitcher)

### 위치
- Desktop: Navbar 우측 (로그인 버튼 왼쪽)
- Mobile: Navbar 우측 (메뉴 버튼 왼쪽)

### 기능
1. 현재 언어 표시 (아이콘 + 언어명)
2. 드롭다운으로 18개 언어 선택
3. 선택 시:
   - 현재 경로 유지하며 locale만 변경
   - Cookie 설정 (180일)
   - 클라이언트 라우팅

### 디자인
- Linear Dark 테마 일치
- Hover 효과
- 현재 언어 체크마크 표시

---

## 🧪 테스트 방법

### 수동 테스트
```bash
# 1. Dev 서버 실행
npm run dev

# 2. 브라우저 테스트
# - http://localhost:3000 접속 → 언어 감지 확인
# - 언어 전환기 동작 확인
# - 경로 유지 확인 (/ko/pinball → /ja/pinball)

# 3. SEO 메타 확인 (개발자 도구)
# - <html lang="...">
# - <link rel="alternate" hreflang="...">
# - <meta property="og:locale">
```

### 자동화 테스트
```bash
# curl 테스트
curl -I http://localhost:3000

# hreflang 확인
curl -s http://localhost:3000/ko/about | grep -i "hreflang"

# Sitemap 확인
curl http://localhost:3000/ko/sitemap.xml
```

상세 QA 체크리스트: `docs/i18n-seo-qa.md` 참조

---

## 📝 새 언어 추가 방법

### 단계 (5분 소요)

1. **번역 파일 생성**
```bash
# 1. 폴더 생성
mkdir locales/ja

# 2. 영어 복사
cp -r locales/en/* locales/ja/

# 3. 번역
# locales/ja/common.json
# locales/ja/nav.json
# locales/ja/pages.json
```

2. **완료!**
- 코드 수정 불필요
- 자동 인식 및 동작

### 예시
```bash
# 일본어 추가
mkdir locales/ja
cp -r locales/en/* locales/ja/
# 번역...
```

---

## 🚀 배포 전 체크리스트

- [ ] 환경 변수 설정 (`NEXT_PUBLIC_SITE_URL`)
- [ ] 빌드 테스트 (`npm run build`)
- [ ] Lighthouse SEO 점수 확인
- [ ] 각 locale 페이지 접근 테스트
- [ ] 언어 전환기 동작 확인
- [ ] Sitemap 생성 확인
- [ ] 봇 감지 동작 확인 (curl User-Agent 테스트)

---

## 🔧 기술 스택

- **Framework**: Next.js 15.5.4 (App Router)
- **i18n**: 커스텀 구현 (middleware + dynamic routes)
- **SEO**: Next.js Metadata API + JSON-LD
- **Cookie**: 180일 유효기간
- **Sitemap**: 동적 생성

---

## 📚 관련 문서

- QA 체크리스트: `docs/i18n-seo-qa.md`
- 아키텍처 문서: `ARCHITECTURE.md`
- 환경 변수: `.env.example`

---

## 🎁 기대 효과

✅ **SEO**: Google 다국어 검색 최적화
✅ **UX**: 사용자 언어 자동 감지 & 전환
✅ **확장성**: 16개 언어 즉시 추가 가능
✅ **호환성**: 기존 URL 자동 리다이렉트
✅ **성능**: 정적 생성 + 최소 JS

---

## 🔗 참고 자료

- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Google Search Central - hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Schema.org - WebPage](https://schema.org/WebPage)
