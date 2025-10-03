# Warning-004: 파일명 길이 제한 추가

## 우선순위
Low

## 관련 파일
- `app/api/pinball/maps/save/route.ts` (L22-27)
- `app/api/pinball/maps/save-game-format/route.ts` (L22-27)
- 또는 `src/lib/pinball/sanitize-filename.ts` (Warning-001 완료 후)

## 문제점
파일명 길이 제한 없음. 파일시스템 제한 초과 가능:
- Windows: 255자 (확장자 포함)
- Linux/macOS: 255 bytes

## 해결 방법

### 옵션 1: sanitizeMapName 함수 수정 (권장)
파일: `src/lib/pinball/sanitize-filename.ts`

```typescript
/**
 * Sanitize map name for safe filesystem usage
 * - Removes invalid characters
 * - Converts spaces to underscores
 * - Converts to lowercase
 * - Limits length to 200 characters (safe margin for extensions)
 */
export function sanitizeMapName(name: string): string {
  const sanitized = name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase() || 'untitled_map';

  // 길이 제한: 200자 (확장자, _game 등 고려)
  return sanitized.slice(0, 200);
}
```

### 옵션 2: API 레벨 검증 추가
**save/route.ts, save-game-format/route.ts**
```typescript
// body 검증 시
if (!name || !json) {
  return NextResponse.json(
    { error: 'Missing required fields: name, json' },
    { status: 400 }
  );
}

// 길이 검증 추가
if (name.length > 200) {
  return NextResponse.json(
    { error: 'Map name is too long (max 200 characters)' },
    { status: 400 }
  );
}
```

## 테스트 케이스
```typescript
// 테스트 입력
const longName = 'a'.repeat(300);
const result = sanitizeMapName(longName);

// 기대 결과
expect(result.length).toBeLessThanOrEqual(200);
```

## 예상 효과
- 파일시스템 에러 방지
- Windows 호환성 보장
- 명확한 에러 메시지 제공
