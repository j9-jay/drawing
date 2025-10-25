#!/bin/bash

echo "=== i18n SEO 테스트 ==="

# 1. 언어 감지 테스트
echo ""
echo "1. 언어 감지 테스트"
curl -sL -H "Accept-Language: ko" http://localhost:3000 | grep -q "lang=\"ko\"" && echo "✅ 한국어 감지" || echo "❌ 한국어 감지 실패"
curl -sL -H "Accept-Language: en" http://localhost:3000 | grep -q "lang=\"en\"" && echo "✅ 영어 감지" || echo "❌ 영어 감지 실패"

# 2. hreflang 테스트
echo ""
echo "2. hreflang 테스트"
HREFLANG_COUNT=$(curl -s http://localhost:3000/ko/about | grep -c 'hreflang=')
if [ "$HREFLANG_COUNT" -eq 19 ]; then
  echo "✅ hreflang 개수 정상 (19개)"
else
  echo "❌ hreflang 개수 비정상 ($HREFLANG_COUNT개)"
fi

# 3. x-default 테스트
echo ""
echo "3. x-default 테스트"
curl -s http://localhost:3000/ko/about | grep -q 'hreflang="x-default"' && echo "✅ x-default 존재" || echo "❌ x-default 없음"

# 4. Canonical 테스트
echo ""
echo "4. Canonical 테스트"
curl -s http://localhost:3000/ko/about | grep -q 'rel="canonical"' && echo "✅ Canonical 존재" || echo "❌ Canonical 없음"

# 5. JSON-LD 테스트
echo ""
echo "5. JSON-LD 테스트"
curl -s http://localhost:3000/ko/about | grep -q 'application/ld+json' && echo "✅ JSON-LD 존재" || echo "❌ JSON-LD 없음"

# 6. Sitemap 테스트
echo ""
echo "6. Sitemap 테스트"
curl -s http://localhost:3000/ko/sitemap.xml | grep -q '<urlset' && echo "✅ Sitemap 생성됨" || echo "❌ Sitemap 없음"

echo ""
echo "=== 테스트 완료 ==="
