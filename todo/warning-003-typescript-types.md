# Warning-003: TypeScript 타입 정의 추가

## 우선순위
Medium

## 관련 파일
- 모든 API Routes (`app/api/pinball/maps/**`)
- 신규 타입 파일 필요

## 문제점
Request body, response 등에 암묵적 `any` 타입 사용으로 타입 안전성 부족

## 해결 방법

### 1단계: 타입 정의 파일 생성
파일: `src/lib/pinball/api-types.ts`

```typescript
// Map 메타데이터
export interface MapMeta {
  name: string;
  canvasSize: { width: number; height: number };
  gridSize: number;
  spawnPoint: { x: number; y: number };
}

// 에디터 맵 구조
export interface EditorMap {
  meta: MapMeta;
  objects: MapObject[];
}

// 맵 오브젝트 (공통 필드)
export interface MapObject {
  id: string;
  type: 'edge' | 'bubble' | 'rotatingBar' | 'jumppad' | 'bounceCircle' | 'finishLine';
  [key: string]: any; // 타입별 추가 필드
}

// API 요청/응답 타입
export interface SaveMapRequest {
  name: string;
  json: string | EditorMap;
}

export interface SaveGameMapRequest {
  name: string;
  mapSpec: string;
}

export interface MapListItem {
  name: string;
  lastModified: string;
  size: number;
}

export interface ApiSuccessResponse {
  success: true;
  message: string;
  filename?: string;
  deletedFiles?: number;
}

export interface ApiErrorResponse {
  error: string;
}
```

### 2단계: 각 API Route에 타입 적용

**save/route.ts**
```typescript
import { SaveMapRequest, EditorMap, ApiSuccessResponse, ApiErrorResponse } from '@/lib/pinball/api-types';

export async function POST(request: NextRequest) {
  const body = await request.json() as SaveMapRequest;

  // ... validation

  return NextResponse.json<ApiSuccessResponse>({
    success: true,
    message: 'Map saved successfully',
    filename: `${sanitizedName}.json`
  });
}
```

**save-game-format/route.ts**
```typescript
import { SaveGameMapRequest, ApiSuccessResponse } from '@/lib/pinball/api-types';

export async function POST(request: NextRequest) {
  const body = await request.json() as SaveGameMapRequest;
  // ...
}
```

**list/route.ts**
```typescript
import { MapListItem } from '@/lib/pinball/api-types';

export async function GET() {
  // ...
  const mapList: MapListItem[] = await Promise.all(/*...*/);
  return NextResponse.json<MapListItem[]>(mapList);
}
```

**load/[name]/route.ts**
```typescript
import { EditorMap, ApiErrorResponse } from '@/lib/pinball/api-types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<EditorMap | ApiErrorResponse>> {
  // ...
}
```

## 검증 방법
1. TypeScript 컴파일 에러 없음 확인
2. IDE에서 자동완성 작동 확인
3. 잘못된 필드 접근 시 타입 에러 발생 확인

## 예상 효과
- 컴파일 타임 에러 검출
- IDE 자동완성 지원
- 리팩토링 안전성 향상
- API 계약 명확화
