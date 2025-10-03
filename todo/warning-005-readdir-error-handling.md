# Warning-005: readdir 에러 처리 개선

## 우선순위
Low

## 관련 파일
- `app/api/pinball/maps/list/route.ts` (L18-23)

## 문제점
`readdir` 실패 시 모든 에러를 무시하고 빈 배열 반환. 권한 문제와 디렉토리 없음을 구분 불가

**현재 코드:**
```typescript
try {
  files = await fs.readdir(mapsDir);
} catch (err) {
  // 디렉토리가 비어있거나 읽을 수 없으면 빈 배열 반환
  return NextResponse.json([]);
}
```

**문제:**
- ENOENT (디렉토리 없음): 빈 배열 반환 OK
- EACCES (권한 없음): 빈 배열 반환은 오해의 소지
- 다른 에러: 사용자에게 알려야 함

## 해결 방법

```typescript
let files: string[];
try {
  files = await fs.readdir(mapsDir);
} catch (err) {
  const error = err as NodeJS.ErrnoException;

  // 디렉토리 없음: 정상 케이스 (빈 목록)
  if (error.code === 'ENOENT') {
    return NextResponse.json([]);
  }

  // 다른 에러 (권한, I/O 등): 상위 catch로 전달
  throw err;
}
```

## 개선 사항
1. ENOENT만 빈 배열 반환
2. 권한 에러는 500 에러로 반환
3. 로그에 실제 에러 기록

## 예상 효과
- 명확한 에러 구분
- 권한 문제 디버깅 용이
- 사용자에게 적절한 피드백
