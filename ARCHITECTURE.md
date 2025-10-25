# ARCHITECTURE.md

Next.js 15 App Router 게임 프로젝트 (핀볼, 룰렛) + 18개 언어 i18n 지원

## Stack

**Core**: Next.js 15.5.4 (App Router), React 19, TypeScript 5, Tailwind CSS 4
**State**: Zustand 5
**Physics**: Planck.js 1.4
**i18n**: 커스텀 구현 (Middleware + Dynamic Routes)
**SEO**: Next.js Metadata API + JSON-LD
**Utils**: lucide-react, clsx, class-variance-authority, tailwind-merge

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root: locale-agnostic
│   ├── [locale]/     # 다국어 페이지 (18개 언어)
│   │   ├── layout.tsx         # <html lang>, SEO, Navbar
│   │   ├── page.tsx           # Home (redirect to about)
│   │   ├── about/page.tsx     # About 페이지
│   │   ├── pinball/           # 핀볼 게임
│   │   │   ├── page.tsx               # 게임 플레이
│   │   │   └── editor/page.tsx        # 맵 에디터
│   │   ├── roulette/page.tsx  # 룰렛 게임
│   │   ├── components/page.tsx # 컴포넌트 데모
│   │   └── sitemap.ts         # Locale별 사이트맵
│   └── api/pinball/maps/      # 맵 CRUD API
│
├── components/       # 공통 컴포넌트 라이브러리
│   ├── ui/          # 21개 UI 컴포넌트
│   ├── layout/      # Navbar (w/ LanguageSwitcher), Footer, Hero, MobileNav
│   ├── game/        # GameCanvas, ControlPanel
│   ├── seo/         # JsonLd
│   └── LanguageSwitcher.tsx  # 언어 전환 콤보박스
│
├── features/
│   ├── pinball/     # 핀볼 게임 Feature
│   │   ├── game/        # 게임 플레이 로직
│   │   ├── editor/      # 맵 에디터
│   │   ├── platform/    # Grid, Snap 유틸
│   │   └── shared/      # 공유 타입/유틸/렌더링
│   └── roulette/    # 룰렛 게임 Feature
│       ├── game/        # 게임 로직 (physics, rendering, ui)
│       └── shared/      # 공유 타입
│
├── lib/             # 유틸리티
│   ├── utils.ts     # 공통 유틸
│   └── i18n/        # 다국어 지원 인프라
│       ├── config.ts       # 18개 locale, fallback 설정
│       ├── detect.ts       # 언어 감지, 봇 감지
│       ├── hreflang.ts     # alternate links 생성
│       ├── cookies.ts      # locale 쿠키 관리
│       ├── translations.ts # 번역 로더
│       └── metadata.ts     # SEO 메타데이터 헬퍼
│
├── styles/
│   └── theme.ts     # Linear Dark 테마
│
├── types/           # 타입 정의
│
└── middleware.ts    # Locale 감지 & 리다이렉트

locales/             # 번역 파일
├── ko/              # 한국어 (완전 번역)
│   ├── common.json
│   ├── nav.json
│   └── pages.json
└── en/              # 영어 (완전 번역)
    ├── common.json
    ├── nav.json
    └── pages.json
    # 나머지 16개 언어: en으로 fallback

data/pinball/maps/   # 핀볼 맵 JSON
```

## 1. 핀볼 게임

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

## 2. 룰렛 게임

**경로**: `/roulette`
**물리**: Canvas 2D + 커스텀 물리 엔진
**스타일**: 독립 CSS 모듈

### 아키텍처

```
features/roulette/
├── game/                    # 게임 로직
│   ├── RouletteGame.ts       # 메인 게임 클래스
│   ├── animation/            # 물리 & 당첨자 판정
│   │   ├── SpinPhysics.ts    # 지수 감속 물리 시뮬레이션
│   │   └── SpinController.ts # 회전 시작/정지, 당첨자 판정
│   ├── rendering/            # 렌더링 & 카메라
│   │   ├── RouletteRenderer.ts # Canvas 렌더링
│   │   └── CameraEffects.ts    # 줌인/카메라 쉐이크
│   ├── ui/                  # UI 관리
│   │   ├── EventHandlers.ts  # 이벤트 리스너
│   │   ├── SettingsUI.ts     # 설정 UI
│   │   ├── WinnerDisplay.ts  # 당첨자 표시
│   │   └── ToastManager.ts   # 알림 토스트
│   ├── storage/             # 저장/복원
│   │   └── RouletteStorage.ts # localStorage 관리
│   ├── constants/           # 상수
│   │   ├── spin.ts          # 물리 상수
│   │   ├── roulette.ts      # 렌더링 상수
│   │   └── camera.ts        # 카메라 상수
│   └── styles/              # CSS 모듈
│       ├── base.css         # 레이아웃/컨테이너
│       ├── components.css   # UI 컴포넌트
│       └── animations.css   # 키프레임 애니메이션
│
└── shared/                  # 공유 모듈
    └── types/
        └── roulette.ts      # 타입 정의

app/roulette/
└── page.tsx                 # 게임 페이지 (Client Component)
```

### 핵심 클래스

**RouletteGame** (`game/RouletteGame.ts`)
- 메인 게임 클래스: 초기화, 상태 관리, 게임 루프
- 의존: RouletteRenderer, SpinPhysics, CameraEffects, EventHandlers
- 상태 전환: idle → spinning → decelerating → stopped
- 60 FPS 게임 루프 (requestAnimationFrame)

**SpinPhysics** (`game/animation/SpinPhysics.ts`)
- 물리 기반 회전: 지수 감속 (exponential decay)
- 공식: `v(t+Δt) = v(t) × friction^(Δt×60)`
- 각도 정규화: [0, 2π) 범위 유지
- 정지 조건: velocity < STOP_THRESHOLD (0.05 rad/s)

**SpinController** (`game/animation/SpinController.ts`)
- 회전 제어 및 당첨자 판정
- 핀셋 위치: 3시 방향 (90°, Math.PI/2)
- 당첨자 알고리즘: (핀셋 각도 - 룰렛 각도) → 정규화 → 섹터 계산
- 가중치 지원: `name*weight` 문법

**RouletteRenderer** (`game/rendering/RouletteRenderer.ts`)
- Canvas 2D 렌더링
- 룰렛 휠, 섹터, 텍스트, 핀셋 렌더링
- 카메라 효과 적용: 줌(1.0 → 1.5x), 쉐이크
- 텍스트 회전: 3시 방향에서 읽기 편하게 자동 회전

**CameraEffects** (`game/rendering/CameraEffects.ts`)
- 줌 효과: 속도 기반 줌인 (ease-in-out cubic)
- 카메라 쉐이크: sin/cos 파형, 지수 감쇠
- 트리거 타이밍: 당첨자 확정 시

**EventHandlers** (`game/ui/EventHandlers.ts`)
- UI 이벤트 바인딩: 캔버스 클릭, 버튼, 입력
- 참가자 파싱: 쉼표/줄바꿈 구분, `name*weight` 가중치
- 실시간 미리보기: 참가자 수, 유효성 검증
- 당첨자 제외 기능

### 물리 시스템

**속도 프리셋** (`constants/spin.ts`):
```typescript
WEAK: 8 rad/s     // ~1.3 RPS, 느린 회전
NORMAL: 15 rad/s  // ~2.4 RPS, 보통
STRONG: 25 rad/s  // ~4.0 RPS, 빠른 회전
```

**물리 상수**:
- FRICTION_COEFFICIENT: 0.98 (프레임당 2% 감속)
- STOP_THRESHOLD: 0.05 rad/s (정지 판단)
- MIN_ROTATION_CYCLES: 3 (최소 3바퀴 회전)
- DECELERATION_THRESHOLD: 0.8 (감속 전환 80%)

**카메라 효과** (`constants/camera.ts`):
- ZOOM_DEFAULT: 1.0, ZOOM_WIN: 1.5
- ZOOM_START_VELOCITY: 1.0 rad/s (줌인 시작 임계값)
- CAMERA_SHAKE_DURATION: 500ms
- CAMERA_SHAKE_INTENSITY: 8px

### 데이터 흐름

1. **초기화** (page.tsx → RouletteGame)
   ```
   useEffect → dynamic import → new RouletteGame()
   → init() → loadSettings() → setupEventListeners()
   ```

2. **회전 시작** (User → EventHandlers → RouletteGame)
   ```
   Click/Button → validateParticipants()
   → createSpinConfig(speed) → startSpinning()
   → state = 'spinning'
   ```

3. **물리 업데이트** (GameLoop → SpinPhysics)
   ```
   requestAnimationFrame → update(timestamp)
   → updatePhysics(deltaTime) → updateSpinPhysics()
   → angle, velocity 갱신
   ```

4. **당첨자 판정** (SpinPhysics → SpinController)
   ```
   stopped = true → onSpinStopped()
   → determineWinner(angle, participants)
   → showWinner() + triggerCameraShake()
   ```

5. **저장/복원** (RouletteStorage → localStorage)
   ```
   setParticipants() → saveParticipants()
   loadSettings() → loadParticipants()
   Speed change → saveSpinSpeed()
   ```

### 타입 정의

**Participant**:
```typescript
{ name: string; weight: number }  // weight: 1 = 기본, 2+ = 가중치
```

**RouletteState**:
```typescript
'idle' | 'spinning' | 'decelerating' | 'stopped'
```

**SpinConfig**:
```typescript
{
  speed: 'WEAK' | 'NORMAL' | 'STRONG';
  initialVelocity: number;
  friction: number;
  minRotations: number;
}
```

**CameraState**:
```typescript
{
  zoom: number;
  targetZoom: number;
  shakeOffset: { x: number; y: number };
}
```

### 저장소

**위치**: localStorage (`rouletteGameSettings`)

**저장 데이터**:
- participants: Participant[]
- defaultSpeed: SpinSpeed
- lastWinner: string (통계용)

**함수**:
- saveParticipants(), loadParticipants()
- saveSpinSpeed(), loadSpinSpeed()
- clearStorage()

### 스타일 시스템

**CSS 모듈 분리** (3개 파일):
1. **base.css** (83줄): 레이아웃, 컨테이너, 캔버스
2. **components.css** (392줄): UI 컴포넌트, 버튼, 토스트
3. **animations.css** (35줄): 키프레임 (bounce, slideIn, explode)

**독립성**: pinball CSS와 완전 분리, `roulette-` prefix 사용

### 주요 기능

- ✅ 물리 기반 회전: 지수 감속, 자연스러운 정지
- ✅ 3시 방향 핀셋: 당첨자 이름 읽기 편함
- ✅ 가중치 시스템: `name*2` 문법으로 확률 조정
- ✅ 카메라 효과: 줌인, 쉐이크 (핀볼 스타일)
- ✅ 당첨자 제외: "당첨자 제외하고 시작" 버튼
- ✅ 저장/복원: localStorage 자동 저장
- ✅ 속도 조절: 약하게/보통/세게 (3단계)
- ✅ 실시간 미리보기: 참가자 수, 유효성 표시
- ✅ 반응형 디자인: 모바일 최적화
- ✅ 전체화면 모드

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

## 6. 다국어 (i18n) 아키텍처

### 지원 언어 (18개)

**번역 완료**: ko (한국어), en (영어)
**설정 완료**: ja, zh-Hans, es, fr, de, pt-BR, ru, it, id, tr, vi, th, hi, ar, nl, pl
- 미번역 언어는 영어로 fallback

### URL 구조

**Before**: `/about`, `/pinball`
**After**: `/{locale}/about`, `/{locale}/pinball`

예시:
- 한국어: `/ko/about`, `/ko/pinball`
- 영어: `/en/about`, `/en/pinball`
- 일본어: `/ja/about` (영어 fallback)

### 언어 감지 로직 (middleware.ts)

1. **Cookie** `locale` (180일 유효) → 유효하면 사용
2. **봇 감지** (User-Agent) → DEFAULT_LOCALE (en)
3. **Accept-Language** 헤더 파싱 → 지원 언어 매핑
4. **기본값** → en

### 리다이렉트 정책

- `/` → `/{detected-locale}/` (302)
- `/xyz/about` (잘못된 locale) → `/en/about` (302)
- 쿠키 자동 저장 (180일)

### SEO 최적화

모든 페이지에 다음 태그 자동 생성:
- `<html lang="{locale}">`
- `<link rel="canonical" href="...">`
- `<link rel="alternate" hreflang="..." href="...">` (19개: 18 + x-default)
- `<meta property="og:locale" content="...">`
- `<meta property="og:locale:alternate" content="...">` (17개)
- `<script type="application/ld+json">` (inLanguage)

### Sitemap

- 경로: `/{locale}/sitemap.xml`
- 각 URL에 18개 locale의 alternate 링크 포함
- changeFrequency: weekly
- priority: 홈(1.0), 나머지(0.8)

### 언어 전환기 (LanguageSwitcher)

- 위치: Navbar 우측 (Desktop & Mobile)
- 드롭다운: 18개 언어 선택
- 동작: 현재 경로 유지하며 locale만 변경 + 쿠키 저장

### 새 언어 추가 방법

```bash
# 1. 번역 파일 생성
mkdir locales/ja
cp -r locales/en/* locales/ja/

# 2. 번역 (common.json, nav.json, pages.json)

# 3. 완료 (코드 수정 불필요)
```

### 관련 파일

- `src/lib/i18n/` - i18n 인프라
- `locales/` - 번역 파일
- `src/middleware.ts` - 언어 감지
- `src/components/LanguageSwitcher.tsx` - UI
- `src/app/[locale]/layout.tsx` - SEO 메타

## 7. 주요 경로 매핑

| 경로 | 파일 | 설명 |
|-----|------|------|
| `/` | `middleware.ts` → `/{locale}/` | 자동 리다이렉트 |
| `/{locale}/` | `app/[locale]/page.tsx` | 홈 (→ /about) |
| `/{locale}/about` | `app/[locale]/about/page.tsx` | About |
| `/{locale}/pinball` | `app/[locale]/pinball/page.tsx` | 핀볼 게임 플레이 |
| `/{locale}/pinball/editor` | `app/[locale]/pinball/editor/page.tsx` | 핀볼 맵 에디터 |
| `/{locale}/roulette` | `app/[locale]/roulette/page.tsx` | 룰렛 게임 |
| `/{locale}/components` | `app/[locale]/components/page.tsx` | 컴포넌트 데모 |
| `/{locale}/sitemap.xml` | `app/[locale]/sitemap.ts` | Sitemap |

## 8. 상태 관리

**글로벌**: Zustand (핀볼 에디터)
**로컬**: React useState/useReducer
**서버 상태**: Next.js Server Components

## 9. 파일 규칙

**Features** (`features/pinball/`, `features/roulette/`):
- 최상위: Package-by-feature
- 하위: Package-by-layer (components, services, state, utils)
- >300L 파일 → 리팩토링 검토

**Components** (`components/`):
- 각 컴포넌트 단일 파일
- `index.ts`로 re-export
- 50-80L 초과 시 SRP 검토

**함수**: camelCase, SRP 준수

## 10. API 엔드포인트

### `/api/pinball/maps`
- `GET`: 맵 목록/단일 조회
- `POST`: 맵 생성
- `PUT`: 맵 수정
- `DELETE`: 맵 삭제

## 11. 성능 최적화

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
- **i18n 문서**: `docs/PR_DESCRIPTION.md`, `docs/i18n-seo-qa.md`
