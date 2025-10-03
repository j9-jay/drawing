# Suggestion-001: List API 성능 최적화

## 우선순위
Low (Phase 7 성능 튜닝 단계에서 처리)

## 관련 파일
- `app/api/pinball/maps/list/route.ts` (L28-38)

## 현재 상황
파일마다 `fs.stat()` 호출하여 메타데이터 수집. 파일 수 많으면 느림

```typescript
const mapList = await Promise.all(
  jsonFiles.map(async (file) => {
    const filePath = path.join(mapsDir, file);
    const stats = await fs.stat(filePath);
    return {
      name: file.replace('.json', ''),
      lastModified: stats.mtime.toISOString(),
      size: stats.size
    };
  })
);
```

## 최적화 방안

### 옵션 1: readdir with withFileTypes
```typescript
const entries = await fs.readdir(mapsDir, { withFileTypes: true });
const jsonEntries = entries.filter(entry =>
  entry.isFile() && entry.name.endsWith('.json')
);

const mapList = await Promise.all(
  jsonEntries.map(async (entry) => {
    const filePath = path.join(mapsDir, entry.name);
    const stats = await fs.stat(filePath);
    return {
      name: entry.name.replace('.json', ''),
      lastModified: stats.mtime.toISOString(),
      size: stats.size
    };
  })
);
```

### 옵션 2: 페이지네이션 추가 (파일 1000개+ 시)
```typescript
// Query params 추가
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  // ... readdir 후
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMaps = mapList.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedMaps,
    total: mapList.length,
    page,
    limit
  });
}
```

### 옵션 3: 캐싱 (Redis/메모리)
```typescript
// 간단한 메모리 캐시 (개발 환경)
const cache = new Map<string, { data: MapListItem[], timestamp: number }>();
const CACHE_TTL = 10000; // 10초

export async function GET() {
  const now = Date.now();
  const cached = cache.get('mapList');

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // ... readdir 로직
  cache.set('mapList', { data: mapList, timestamp: now });
  return NextResponse.json(mapList);
}
```

## 측정 지표
- 파일 10개: ~50ms (현재 OK)
- 파일 100개: ~200ms (최적화 불필요)
- 파일 1000개: ~2초 (최적화 필요)

## 적용 시점
Phase 7 성능 프로파일링 후 실제 병목 확인되면 적용

## 예상 효과
- 응답 시간 50% 감소 (옵션 1)
- 대용량 처리 (옵션 2)
- API 부하 감소 (옵션 3)
