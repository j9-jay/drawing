# i18n SEO QA 체크리스트

## 📋 테스트 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" > .env.local

# 3. Dev 서버 실행
npm run dev
```

---

## ✅ 기본 기능 테스트

### 1. 언어 감지 및 리다이렉트

| 테스트 케이스 | 예상 동작 | 상태 |
|------------|---------|-----|
| `/` 접속 (Accept-Language: ko) | `/ko/` 리다이렉트 | ⬜ |
| `/` 접속 (Accept-Language: en) | `/en/` 리다이렉트 | ⬜ |
| `/` 접속 (Accept-Language: ja) | `/ja/` 리다이렉트 | ⬜ |
| `/` 접속 (봇 User-Agent) | `/en/` 리다이렉트 | ⬜ |
| Cookie `locale=ko` 존재 시 | `/ko/` 리다이렉트 | ⬜ |
| 잘못된 locale `/xyz/about` | `/en/about` 리다이렉트 | ⬜ |

**테스트 명령어**:
```bash
# 한국어
curl -L -H "Accept-Language: ko-KR,ko;q=0.9" http://localhost:3000

# 봇
curl -L -A "Googlebot" http://localhost:3000

# 잘못된 locale
curl -L http://localhost:3000/xyz/about
```

---

### 2. 언어 전환기

| 테스트 케이스 | 예상 동작 | 상태 |
|------------|---------|-----|
| `/ko/about`에서 영어 선택 | `/en/about`로 이동 | ⬜ |
| `/ko/pinball`에서 일본어 선택 | `/ja/pinball`로 이동 | ⬜ |
| 언어 선택 후 Cookie 확인 | `locale={선택언어}` 저장됨 | ⬜ |
| 모바일 화면에서 언어 전환기 표시 | 정상 표시 | ⬜ |
| 드롭다운 18개 언어 모두 표시 | 정상 표시 | ⬜ |
| 현재 언어 체크마크 표시 | 정상 표시 | ⬜ |

---

### 3. 페이지 접근성

| 페이지 | /ko/ | /en/ | /ja/ | 상태 |
|-------|------|------|------|-----|
| 홈 (/) | ✓ | ✓ | ✓ | ⬜ |
| About | ✓ | ✓ | ✓ | ⬜ |
| Pinball | ✓ | ✓ | ✓ | ⬜ |
| Pinball Editor | ✓ | ✓ | ✓ | ⬜ |
| Roulette | ✓ | ✓ | ✓ | ⬜ |
| Components | ✓ | ✓ | ✓ | ⬜ |

---

## 🔍 SEO 메타 태그 테스트

### 1. HTML lang 속성

| Locale | 예상 값 | 실제 값 | 상태 |
|--------|--------|--------|-----|
| ko | `<html lang="ko">` | | ⬜ |
| en | `<html lang="en">` | | ⬜ |
| ja | `<html lang="ja">` | | ⬜ |

**확인 방법**:
```bash
curl -s http://localhost:3000/ko/about | grep -o '<html[^>]*>'
curl -s http://localhost:3000/en/about | grep -o '<html[^>]*>'
```

---

### 2. Canonical Link

| 페이지 | 예상 Canonical | 상태 |
|-------|---------------|-----|
| /ko/about | `<link rel="canonical" href="http://localhost:3000/ko/about" />` | ⬜ |
| /en/pinball | `<link rel="canonical" href="http://localhost:3000/en/pinball" />` | ⬜ |
| /ja/roulette | `<link rel="canonical" href="http://localhost:3000/ja/roulette" />` | ⬜ |

**확인 방법**:
```bash
curl -s http://localhost:3000/ko/about | grep 'rel="canonical"'
```

---

### 3. Hreflang Links

| 페이지 | hreflang 개수 | x-default 존재 | 상태 |
|-------|-------------|--------------|-----|
| /ko/about | 19 (18 + x-default) | ✓ | ⬜ |
| /en/pinball | 19 | ✓ | ⬜ |
| /ja/roulette | 19 | ✓ | ⬜ |

**확인 방법**:
```bash
# hreflang 개수
curl -s http://localhost:3000/ko/about | grep -c 'rel="alternate"'

# x-default 존재
curl -s http://localhost:3000/ko/about | grep 'hreflang="x-default"'

# 전체 hreflang 목록
curl -s http://localhost:3000/ko/about | grep 'hreflang=' | head -20
```

**예상 출력 (일부)**:
```html
<link rel="alternate" hreflang="ko" href="http://localhost:3000/ko/about"/>
<link rel="alternate" hreflang="en" href="http://localhost:3000/en/about"/>
<link rel="alternate" hreflang="ja" href="http://localhost:3000/ja/about"/>
...
<link rel="alternate" hreflang="x-default" href="http://localhost:3000/en/about"/>
```

---

### 4. Open Graph Meta

| 메타 태그 | 예상 값 (ko) | 상태 |
|----------|------------|-----|
| og:locale | `ko_KR` | ⬜ |
| og:locale:alternate (개수) | 17개 | ⬜ |
| og:locale:alternate (en) | `en_US` | ⬜ |
| og:locale:alternate (ja) | `ja_JP` | ⬜ |

**확인 방법**:
```bash
# og:locale
curl -s http://localhost:3000/ko/about | grep 'property="og:locale"'

# og:locale:alternate 개수
curl -s http://localhost:3000/ko/about | grep -c 'property="og:locale:alternate"'

# 전체 목록
curl -s http://localhost:3000/ko/about | grep 'property="og:locale' | head -20
```

---

### 5. JSON-LD Structured Data

| 페이지 | inLanguage | @type | 상태 |
|-------|-----------|-------|-----|
| /ko/about | "ko" | "WebPage" | ⬜ |
| /en/pinball | "en" | "WebPage" | ⬜ |
| /ja/roulette | "ja" | "WebPage" | ⬜ |

**확인 방법**:
```bash
curl -s http://localhost:3000/ko/about | grep -A 10 'application/ld+json' | grep 'inLanguage'
```

**예상 출력**:
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "inLanguage": "ko",
  ...
}
```

---

## 🗺️ Sitemap 테스트

### 1. Sitemap 접근성

| Locale | URL | 상태 |
|--------|-----|-----|
| ko | http://localhost:3000/ko/sitemap.xml | ⬜ |
| en | http://localhost:3000/en/sitemap.xml | ⬜ |
| ja | http://localhost:3000/ja/sitemap.xml | ⬜ |

**확인 방법**:
```bash
curl http://localhost:3000/ko/sitemap.xml
```

---

### 2. Sitemap 내용 확인

| 항목 | 예상 값 | 상태 |
|-----|--------|-----|
| URL 개수 | 6개 (/, /about, /pinball, /pinball/editor, /roulette, /components) | ⬜ |
| xhtml:link 개수 (per URL) | 18개 | ⬜ |
| lastModified 존재 | ✓ | ⬜ |
| changeFrequency | "weekly" | ⬜ |
| priority (/) | 1.0 | ⬜ |
| priority (기타) | 0.8 | ⬜ |

**확인 방법**:
```bash
# URL 개수
curl -s http://localhost:3000/ko/sitemap.xml | grep -c '<url>'

# xhtml:link (예시 하나)
curl -s http://localhost:3000/ko/sitemap.xml | grep 'xhtml:link' | head -5
```

---

## 🧪 브라우저 테스트

### 1. 개발자 도구 확인

| 항목 | 위치 | 확인 사항 | 상태 |
|-----|------|----------|-----|
| HTML lang | Elements → `<html>` | lang 속성 확인 | ⬜ |
| Meta 태그 | Elements → `<head>` | hreflang, canonical, og 태그 | ⬜ |
| JSON-LD | Elements → `<script type="application/ld+json">` | inLanguage 확인 | ⬜ |
| Cookie | Application → Cookies | `locale` 쿠키 존재 | ⬜ |

---

### 2. 언어 전환 플로우

1. `/ko/about` 접속
2. 언어 전환기 클릭
3. "English" 선택
4. `/en/about`로 이동 확인
5. 쿠키 `locale=en` 확인
6. 새로고침 시 `/en/about` 유지 확인

| 단계 | 예상 동작 | 실제 동작 | 상태 |
|-----|---------|----------|-----|
| 1 | /ko/about 접속 | | ⬜ |
| 2 | 드롭다운 열림 | | ⬜ |
| 3 | 18개 언어 표시 | | ⬜ |
| 4 | English 선택 | | ⬜ |
| 5 | /en/about 이동 | | ⬜ |
| 6 | Cookie 저장 | | ⬜ |
| 7 | 새로고침 시 유지 | | ⬜ |

---

## 🚀 Lighthouse SEO 점수

| 페이지 | SEO 점수 목표 | 실제 점수 | 상태 |
|-------|-------------|----------|-----|
| /ko/ | 100 | | ⬜ |
| /ko/about | 100 | | ⬜ |
| /en/pinball | 100 | | ⬜ |

**확인 사항**:
- ✅ 유효한 hreflang
- ✅ 유효한 canonical
- ✅ 올바른 lang 속성
- ✅ robots.txt 접근 가능
- ✅ 크롤링 가능한 링크

---

## 🧪 자동화 테스트 스크립트

### scripts/test-i18n.sh

```bash
#!/bin/bash

echo "=== i18n SEO 테스트 ==="

# 1. 언어 감지 테스트
echo "\n1. 언어 감지 테스트"
curl -sL -H "Accept-Language: ko" http://localhost:3000 | grep -q "lang=\"ko\"" && echo "✅ 한국어 감지" || echo "❌ 한국어 감지 실패"
curl -sL -H "Accept-Language: en" http://localhost:3000 | grep -q "lang=\"en\"" && echo "✅ 영어 감지" || echo "❌ 영어 감지 실패"

# 2. hreflang 테스트
echo "\n2. hreflang 테스트"
HREFLANG_COUNT=$(curl -s http://localhost:3000/ko/about | grep -c 'hreflang=')
if [ "$HREFLANG_COUNT" -eq 19 ]; then
  echo "✅ hreflang 개수 정상 (19개)"
else
  echo "❌ hreflang 개수 비정상 ($HREFLANG_COUNT개)"
fi

# 3. x-default 테스트
echo "\n3. x-default 테스트"
curl -s http://localhost:3000/ko/about | grep -q 'hreflang="x-default"' && echo "✅ x-default 존재" || echo "❌ x-default 없음"

# 4. Canonical 테스트
echo "\n4. Canonical 테스트"
curl -s http://localhost:3000/ko/about | grep -q 'rel="canonical"' && echo "✅ Canonical 존재" || echo "❌ Canonical 없음"

# 5. JSON-LD 테스트
echo "\n5. JSON-LD 테스트"
curl -s http://localhost:3000/ko/about | grep -q 'application/ld+json' && echo "✅ JSON-LD 존재" || echo "❌ JSON-LD 없음"

# 6. Sitemap 테스트
echo "\n6. Sitemap 테스트"
curl -s http://localhost:3000/ko/sitemap.xml | grep -q '<urlset' && echo "✅ Sitemap 생성됨" || echo "❌ Sitemap 없음"

echo "\n=== 테스트 완료 ==="
```

**실행 방법**:
```bash
chmod +x scripts/test-i18n.sh
./scripts/test-i18n.sh
```

---

## 📊 QA 완료 체크리스트

### 필수 항목
- [ ] 모든 locale 페이지 접근 가능
- [ ] 언어 전환기 정상 동작
- [ ] hreflang 태그 19개 (18 + x-default)
- [ ] Canonical 태그 존재
- [ ] Open Graph locale 태그 존재
- [ ] JSON-LD inLanguage 존재
- [ ] Sitemap 생성 확인
- [ ] Cookie 저장 확인
- [ ] Lighthouse SEO 100점

### 선택 항목
- [ ] 모든 번역 검토 (ko, en)
- [ ] 모바일 반응형 확인
- [ ] 다양한 브라우저 테스트
- [ ] 접근성 테스트

---

## 🐛 알려진 이슈

| 이슈 | 설명 | 해결 방법 | 상태 |
|-----|------|----------|-----|
| - | - | - | - |

---

## 📝 테스트 결과 기록

**테스트 일시**: _______________
**테스터**: _______________
**환경**: _______________

**전체 QA 통과율**: _____ / _____ (____%)

**의견 및 특이사항**:
```
```
