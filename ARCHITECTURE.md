# ARCHITECTURE.md

Next.js 15 App Router 블로그 + 핀볼 게임 프로젝트

## Stack

**Core**: Next.js 15.5.4 (App Router), React 19, TypeScript 5, Tailwind CSS 4
**State**: Zustand 5
**Physics**: Planck.js 1.4
**Content**: MDX (next-mdx-remote, gray-matter)
**Utils**: lucide-react, clsx, class-variance-authority, tailwind-merge

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root: Navbar, ToastProvider
│   ├── page.tsx      # Home
│   ├── about/        # About 페이지
│   ├── posts/        # 블로그 포스트
│   │   ├── page.tsx           # 포스트 목록
│   │   └── [slug]/page.tsx    # 포스트 상세
│   ├── pinball/      # 핀볼 게임
│   │   ├── page.tsx           # 게임 플레이
│   │   └── editor/page.tsx    # 맵 에디터
│   ├── components/   # 컴포넌트 데모
│   └── api/pinball/maps/      # 맵 CRUD API
│
├── components/       # 공통 컴포넌트 라이브러리
│   ├── ui/          # 21개 UI 컴포넌트
│   ├── layout/      # Navbar, Footer, Hero, MobileNav
│   └── game/        # GameCanvas, ControlPanel
│
├── features/pinball/ # 핀볼 게임 Feature
│   ├── game/        # 게임 플레이 로직
│   ├── editor/      # 맵 에디터
│   ├── platform/    # Grid, Snap 유틸
│   └── shared/      # 공유 타입/유틸/렌더링
│
├── lib/             # 유틸리티
│   ├── mdx.ts       # MDX 파싱
│   ├── posts.ts     # 포스트 조회
│   └── utils.ts     # 공통 유틸
│
├── styles/
│   └── theme.ts     # Linear Dark 테마
│
└── types/
    └── post.ts      # 포스트 타입

content/posts/       # MDX 블로그 포스트
data/pinball/maps/   # 핀볼 맵 JSON
```

## 1. 블로그 시스템

**경로**: `/posts`, `/posts/[slug]`
**파일**: `content/posts/*.mdx`

### 흐름
1. `lib/mdx.ts` - MDX 파싱 (gray-matter)
2. `lib/posts.ts` - 포스트 조회 API
3. `app/posts/page.tsx` - 목록 렌더링
4. `app/posts/[slug]/page.tsx` - MDX 렌더링 (next-mdx-remote)

### 타입
- `Post`: slug, title, date, description, tags, content
- `PostMeta`: Post에서 content 제외

## 2. 핀볼 게임

**경로**: `/pinball` (플레이), `/pinball/editor` (에디터)
**물리**: Planck.js Box2D
**상태**: Zustand

### 아키텍처

```
features/pinball/
├── game/                    # 게임 플레이
│   ├── PinballGame.ts       # 메인 게임 클래스
│   ├── camera/              # 카메라 (zoom, pan)
│   ├── control/             # 게임 컨트롤러
│   ├── core/                # GameLoop, UpdateManager
│   ├── entities/            # Marble, Participant, Obstacle
│   ├── events/              # 이벤트 핸들러
│   ├── loop/                # 게임 루프
│   ├── map/                 # 맵 로딩/라이프사이클
│   ├── minimap/             # 미니맵
│   ├── physics/             # 물리 엔진, ContactHandler
│   ├── rendering/           # 게임 렌더러
│   ├── storage/             # 세션/로컬 스토리지
│   ├── ui/                  # 리더보드, 설정, 토스트
│   ├── utils/               # FPS, Quality, Color
│   └── constants/           # 설정값
│
├── editor/                  # 맵 에디터
│   ├── components/canvas/   # 캔버스 렌더링/상호작용
│   ├── services/            # 맵 저장/로딩/목록
│   ├── state/               # Zustand 상태 (slices, actions)
│   └── utils/
│
├── shared/                  # 공유 모듈
│   ├── types/               # Map, GameObject 타입
│   ├── rendering/           # 공통 렌더러
│   └── utils/               # rotatingBarSpeed, sessionStorage
│
└── platform/                # 플랫폼 유틸
    ├── Grid.ts              # 그리드 시스템
    └── Snap.ts              # 스냅 기능
```

### 핵심 클래스

**PinballGame** (`game/PinballGame.ts`)
- 진입점: 게임 초기화/실행/종료
- 의존: GameInitializer, GameLoop, UpdateManager

**GameLoop** (`game/core/GameLoop.ts`)
- 고정 60 FPS 루프 (requestAnimationFrame)
- Physics step → Update → Render

**MapLoader** (`game/map/MapLoader.ts`)
- JSON → Planck.js 물리 객체 생성
- Wall, RotatingBar, Hole, Goal 등

**Editor State** (`editor/state/editorState.ts`)
- Zustand 스토어: map, selection, tool, camera, settings
- Slices: mapSlice, selectionSlice, toolSlice, cameraSlice, settingsSlice

### 맵 데이터

**위치**: `data/pinball/maps/*.json`
**API**: `/api/pinball/maps` (GET, POST, PUT, DELETE)

**구조**:
```typescript
{
  id: string,
  name: string,
  width: number,
  height: number,
  objects: GameObject[],  // Wall, RotatingBar, Hole, Goal
  participants: Participant[]
}
```

## 3. 컴포넌트 시스템

**위치**: `src/components/`
**Path alias**: `@/components/{ui,layout,game}`

### UI 컴포넌트 (21개)
Button, Input, Link, Card, Badge, Modal, Toast, Tabs, Skeleton, CodeBlock, Breadcrumb, Pagination, Container, Section, Divider, Typography (Heading, Text)

### Layout
- Navbar: 전역 네비게이션
- Footer: 푸터
- Hero: 히어로 섹션
- MobileNav: 모바일 메뉴

### Game
- GameCanvas: 캔버스 래퍼
- ControlPanel: 게임 컨트롤

### 테마
`@/styles/theme` - Linear Dark 컬러, 타이포, 간격

### 데모
`/components` - 전체 컴포넌트 API/예제

## 4. 개발 패턴

### 컴포넌트 우선순위
1. `@/components/{ui,layout,game}` 기존 컴포넌트 사용
2. Theme (`@/styles/theme`) 사용
3. Tailwind 유틸리티
4. shadcn/ui (필요 시)

### Server vs Client
- 기본: Server Component
- `'use client'`: hooks, 이벤트, 브라우저 API, 상태

### File Naming
- `page.tsx`: 페이지
- `layout.tsx`: 레이아웃
- `loading.tsx`: 로딩
- `error.tsx`: 에러 바운더리

### 라우팅
`next/link` 또는 `@/components/ui/Link`

## 5. 빌드 설정

**TypeScript**: strict mode, `@/*` → `./src/*`
**Turbopack**: dev/build 모두 활성화
**Lint**: ESLint (next/core-web-vitals, next/typescript)

### Scripts
```bash
npm run dev    # Turbopack dev
npm run build  # Turbopack build
npm start      # Production
npm run lint   # ESLint
```

## 6. 주요 경로 매핑

| 경로 | 파일 | 설명 |
|-----|------|------|
| `/` | `app/page.tsx` | 홈 |
| `/posts` | `app/posts/page.tsx` | 블로그 목록 |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | 포스트 상세 |
| `/pinball` | `app/pinball/page.tsx` | 게임 플레이 |
| `/pinball/editor` | `app/pinball/editor/page.tsx` | 맵 에디터 |
| `/components` | `app/components/page.tsx` | 컴포넌트 데모 |
| `/about` | `app/about/page.tsx` | About |

## 7. 상태 관리

**글로벌**: Zustand (핀볼 에디터)
**로컬**: React useState/useReducer
**서버 상태**: Next.js Server Components

## 8. 파일 규칙

**Features** (`features/pinball/`):
- 최상위: Package-by-feature
- 하위: Package-by-layer (components, services, state, utils)
- >300L 파일 → 리팩토링 검토

**Components** (`components/`):
- 각 컴포넌트 단일 파일
- `index.ts`로 re-export
- 50-80L 초과 시 SRP 검토

**함수**: camelCase, SRP 준수

## 9. API 엔드포인트

### `/api/pinball/maps`
- `GET`: 맵 목록/단일 조회
- `POST`: 맵 생성
- `PUT`: 맵 수정
- `DELETE`: 맵 삭제

## 10. 성능 최적화

**게임**:
- 고정 60 FPS 루프
- FPS 모니터링 (`game/utils/FPSMonitor.ts`)
- Adaptive Quality (`game/utils/AdaptiveQuality.ts`)
- Aggressive Sleep (`game/utils/AggressiveSleep.ts`)

**Next.js**:
- Turbopack 빌드
- Server Components 기본
- Dynamic import (필요 시)

## 참고 사항

- **시크릿 금지**: DB 비밀번호, API 키 하드코딩 불가
- **컴포넌트 재사용**: 신규 생성 전 기존 확인 필수
- **테마 우선**: `@/styles/theme` 사용
- **타입 안전**: TypeScript strict mode
