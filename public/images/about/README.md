# About 페이지 이미지

이 폴더는 About 페이지에서 사용하는 이미지를 관리합니다.

## 📁 현재 파일

### 1. logo-placeholder.svg
- **용도**: EasyPicky 브랜드 로고
- **현재 상태**: SVG placeholder
- **교체 필요**: ✅ Yes

### 2. game-screenshot-placeholder.svg
- **용도**: 게임 플레이 스크린샷 (핀볼/룰렛)
- **현재 상태**: SVG placeholder
- **교체 필요**: ✅ Yes

## 🔄 이미지 교체 방법

### 방법 1: 파일명 유지하여 교체 (추천)
```bash
# 기존 placeholder 삭제 후 동일한 파일명으로 교체
rm logo-placeholder.svg
cp /path/to/your/logo.png logo-placeholder.png

# 또는 원본 확장자 유지
mv logo-placeholder.svg logo.png
```

코드에서 경로 수정:
```tsx
// Before
<Image src="/images/about/logo-placeholder.svg" ... />

// After
<Image src="/images/about/logo.png" ... />
```

### 방법 2: 새 파일명으로 추가
```bash
# 새 이미지 추가
cp /path/to/your/easypicky-logo.png ./easypicky-logo.png
```

코드에서 경로 수정:
```tsx
<Image src="/images/about/easypicky-logo.png" ... />
```

## 📐 권장 이미지 사양

### Logo (logo-placeholder.svg → logo.png/jpg/svg)
- **크기**: 400x400px (정사각형)
- **포맷**: PNG (투명 배경), JPG, SVG
- **용량**: 100KB 이하 권장
- **용도**: About 페이지 상단 브랜드 로고

### Game Screenshot (game-screenshot-placeholder.svg → game-screenshot.png/jpg)
- **크기**: 800x600px (4:3 비율) 또는 1200x800px (3:2 비율)
- **포맷**: PNG, JPG
- **용량**: 500KB 이하 권장
- **용도**: 게임 소개 섹션 스크린샷

## 🎨 이미지 최적화 팁

1. **압축**: [TinyPNG](https://tinypng.com/) 또는 [Squoosh](https://squoosh.app/) 사용
2. **WebP 변환**: 더 나은 압축률을 위해 WebP 포맷 고려
3. **Responsive**: 여러 해상도 제공 시 `@2x`, `@3x` suffix 사용

## 📝 체크리스트

- [ ] 로고 이미지 교체 완료
- [ ] 게임 스크린샷 교체 완료
- [ ] 이미지 최적화 (압축) 완료
- [ ] About 페이지에서 이미지 정상 표시 확인
- [ ] alt 속성 적절히 설정되었는지 확인

## 🔗 참고

- About 페이지 코드: `/src/app/[locale]/about/page.tsx`
- 이미지 경로: `/public/images/about/`
- 브라우저 접근: `https://yourdomain.com/images/about/`
