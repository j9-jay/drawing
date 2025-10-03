# Warning-001: Filename Sanitization 중복 제거

## 우선순위
Medium

## 관련 파일
- `app/api/pinball/maps/save/route.ts` (L22-27)
- `app/api/pinball/maps/save-game-format/route.ts` (L22-27)

## 문제점
동일한 filename sanitization 로직이 2개 파일에 중복됨

```typescript
const sanitizedName = name
  .replace(/[<>:"/\\|?*]/g, '_')
  .replace(/\s+/g, '_')
  .replace(/_+/g, '_')
  .replace(/^_|_$/g, '')
  .toLowerCase() || 'untitled_map';
```

## 해결 방법

### 1단계: 공통 유틸 함수 생성
파일: `src/lib/pinball/sanitize-filename.ts`
```typescript
/**
 * Sanitize map name for safe filesystem usage
 * - Removes invalid characters
 * - Converts spaces to underscores
 * - Converts to lowercase
 * @param name - Original map name
 * @returns Sanitized filename (without extension)
 */
export function sanitizeMapName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase() || 'untitled_map';
}
```

### 2단계: 기존 파일 수정

**app/api/pinball/maps/save/route.ts**
```typescript
import { sanitizeMapName } from '@/lib/pinball/sanitize-filename';

// Replace lines 22-27 with:
const sanitizedName = sanitizeMapName(name);
```

**app/api/pinball/maps/save-game-format/route.ts**
```typescript
import { sanitizeMapName } from '@/lib/pinball/sanitize-filename';

// Replace lines 22-27 with:
const sanitizedName = sanitizeMapName(name);
```

## 검증 방법
1. 두 API 엔드포인트에서 동일한 입력으로 동일한 파일명 생성 확인
2. 특수문자 포함 이름 테스트: `"My Map!@#$%"` → `"my_map"`
3. 공백 테스트: `"Test   Map"` → `"test_map"`

## 예상 효과
- 코드 중복 제거 (DRY 원칙)
- 유지보수성 향상
- 향후 sanitization 로직 변경 시 한 곳만 수정
