# Warning-002: mkdir 에러 처리 간소화

## 우선순위
Low

## 관련 파일
- `app/api/pinball/maps/list/route.ts` (L10-14)
- `app/api/pinball/maps/save/route.ts` (L19)
- `app/api/pinball/maps/save-game-format/route.ts` (L19)

## 문제점
`recursive: true` 옵션 사용 시 이미 디렉토리가 존재해도 에러가 발생하지 않음에도 불구하고 불필요한 try-catch 사용

**현재 코드 (list/route.ts):**
```typescript
try {
  await fs.mkdir(mapsDir, { recursive: true });
} catch (err) {
  // 이미 존재하는 경우 무시
}
```

**문제:**
- `recursive: true`는 이미 존재 시 에러 발생 안 함
- EACCES (권한 없음) 같은 실제 에러도 무시됨

## 해결 방법

### list/route.ts (L10-14)
```typescript
// 간소화: recursive: true는 이미 존재 시 에러 없음
await fs.mkdir(mapsDir, { recursive: true });
```

### save/route.ts (L19)
```typescript
// 디렉토리 생성 (이미 존재 시 무시)
await fs.mkdir(mapsDir, { recursive: true });
```

### save-game-format/route.ts (L19)
```typescript
// 디렉토리 생성 (이미 존재 시 무시)
await fs.mkdir(mapsDir, { recursive: true });
```

## 참고 자료
Node.js 공식 문서: `fs.mkdir()` with `recursive: true`
> If recursive is true, the first directory path created will be returned.
> If the directory already exists, no error is thrown.

## 예상 효과
- 코드 간소화
- 실제 에러 (권한 문제 등) 상위 catch 블록으로 전달
- 더 명확한 에러 추적
