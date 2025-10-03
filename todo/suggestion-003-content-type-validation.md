# Suggestion-003: Content-Type 검증

## 우선순위
Low

## 관련 파일
- `app/api/pinball/maps/save/route.ts`
- `app/api/pinball/maps/save-game-format/route.ts`

## 현재 상황
POST 요청의 Content-Type 검증 없음. 잘못된 형식 요청도 처리 시도

## 해결 방법

### 각 POST API에 추가
```typescript
export async function POST(request: NextRequest) {
  // Content-Type 검증
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 } // Unsupported Media Type
    );
  }

  const body = await request.json();
  // ... 기존 로직
}
```

### 또는 공통 유틸로 추출
```typescript
// src/lib/api-validation.ts
export function validateContentType(request: NextRequest): NextResponse | null {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    );
  }
  return null;
}

// Usage
const validationError = validateContentType(request);
if (validationError) return validationError;
```

## 테스트
```bash
# 잘못된 Content-Type
curl -X POST http://localhost:3000/api/pinball/maps/save \
  -H "Content-Type: text/plain" \
  -d '{"name":"test","json":"{}"}'

# 기대 응답: 415 Unsupported Media Type
```

## 예상 효과
- 명확한 에러 메시지
- 잘못된 요청 조기 차단
- API 사양 명확화
