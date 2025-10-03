# Suggestion-002: 로깅 개선

## 우선순위
Low (프로덕션 배포 전 처리)

## 관련 파일
- 모든 API Routes (console.error 사용 중)

## 현재 상황
`console.error`만 사용. 프로덕션 환경에서 추적 어려움

```typescript
} catch (error) {
  console.error('Failed to save map:', error);
  return NextResponse.json({ error: 'Failed to save map' }, { status: 500 });
}
```

**문제점:**
- timestamp 없음
- request ID 없음
- 에러 스택 손실
- 로그 레벨 구분 없음

## 해결 방법

### 옵션 1: 간단한 구조화 로깅
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },

  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta
    }));
  }
};

// Usage in API routes
import { logger } from '@/lib/logger';

try {
  // ...
} catch (error) {
  logger.error('Failed to save map', error as Error, {
    mapName: name,
    endpoint: '/api/pinball/maps/save'
  });
  return NextResponse.json({ error: 'Failed to save map' }, { status: 500 });
}
```

### 옵션 2: Winston/Pino 사용
```bash
npm install pino pino-pretty
```

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});

// Usage
logger.error({ err: error, mapName: name }, 'Failed to save map');
```

### 옵션 3: Request ID 추가 (middleware)
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function middleware(request: NextRequest) {
  const requestId = uuidv4();
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);
  return response;
}

export const config = {
  matcher: '/api/:path*',
};

// API routes에서 사용
const requestId = request.headers.get('X-Request-ID');
logger.error('Failed to save map', error, { requestId, mapName: name });
```

## 적용 시점
프로덕션 배포 준비 단계 (Phase 8+)

## 예상 효과
- 에러 추적 용이
- 디버깅 시간 단축
- 프로덕션 모니터링 가능
- 로그 분석 자동화 가능
