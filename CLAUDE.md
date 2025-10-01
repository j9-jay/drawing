# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15.5.4 blog using App Router, React 19, TypeScript, Tailwind CSS 4.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Dev server: http://localhost:3000

## Code Structure

- **App Router**: `src/app/` - pages/layouts using Next.js App Router
  - `layout.tsx`: Root layout, Geist fonts, ToastProvider
  - `page.tsx`: Home page
- **Components**: `src/components/` - centralized component library
  - `ui/`: UI components (Button, Input, Card, Modal, Toast, etc.)
  - `layout/`: Layout components (Navbar, Footer, Hero)
  - `game/`: Game-specific components (GameCanvas, ControlPanel)
- **Styles**: `src/styles/` - theme configuration
  - `theme.ts`: Linear Dark theme (colors, typography, spacing)
- **Path alias**: `@/*` → `./src/*`

## Technical Stack

### Core Framework
- **Next.js 15.5.4**: App Router, Server Components, Turbopack
  - Use App Router for all pages (`src/app/`)
  - Server Components by default, use `'use client'` only when needed
  - File-based routing with `page.tsx`, `layout.tsx`
- **React 19.1.0**: Latest features including improved hooks
- **TypeScript 5**: Strict mode enabled, all code must be typed

### Styling
- **Tailwind CSS 4**: Utility-first CSS framework
  - Use Tailwind utility classes for styling
  - PostCSS integration enabled
  - Custom theme configuration available
- **shadcn/ui**: Component library (when needed)
  - Can be used alongside custom components in `src/components/`
  - Follow shadcn/ui installation and usage patterns

### Code Quality
- **ESLint**: next/core-web-vitals, next/typescript
- **Path Alias**: `@/*` → `./src/*`

## Development Rules

### Component Usage (MANDATORY)

**ALWAYS use existing components from `src/components/` before creating new ones.**

1. **Check component library first**:
   - All UI components: `@/components/ui`
   - Layout components: `@/components/layout`
   - Game components: `@/components/game`

2. **Available components**:
   - **UI**: Button, Input, Link, Card, Badge, Modal, Toast, Tabs, Skeleton, CodeBlock, Breadcrumb, Pagination, Container, Section, Divider, Typography (Heading, Text)
   - **Layout**: Navbar, Footer, Hero
   - **Game**: GameCanvas, ControlPanel

3. **Theme usage**: Import and use `theme` from `@/styles/theme` for all styling (colors, spacing, typography, etc.)

4. **Examples**:
   ```tsx
   import { Button, Card, Modal } from '@/components/ui';
   import { Navbar } from '@/components/layout';
   import { theme } from '@/styles/theme';
   ```

5. **Demo reference**: Check `/components` page (http://localhost:3000/components) for component APIs and usage examples

6. **Creating new components**: Only create new components if:
   - No existing component fits the use case
   - Combination of existing components doesn't work
   - Document in CLAUDE.md after creation

### Styling Rules

1. **Prefer existing custom components** from `src/components/` with theme integration
2. **Use Tailwind CSS** for utility styling when appropriate
3. **Use shadcn/ui** for additional UI components when custom components don't fit
4. **Theme system** available at `@/styles/theme` for consistent design values
   - Colors: `theme.colors.*`
   - Spacing: `theme.spacing.*`
   - Typography: `theme.typography.*`
   - Border radius: `theme.borderRadius.*`
   - Transitions: `theme.transitions.*`

### Next.js Best Practices

1. **Server vs Client Components**:
   - Default to Server Components
   - Use `'use client'` only for: hooks, event handlers, browser APIs, state management

2. **File naming**:
   - Pages: `page.tsx`
   - Layouts: `layout.tsx`
   - Loading states: `loading.tsx`
   - Error boundaries: `error.tsx`

3. **Routing**: Use Next.js Link component for navigation
   ```tsx
   import Link from 'next/link';
   // Use custom Link component: import { Link } from '@/components/ui';
   ```
