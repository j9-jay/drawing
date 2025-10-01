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

- Next.js 15.5.4 (Turbopack enabled)
- React 19.1.0
- TypeScript 5 (strict mode)
- Tailwind CSS 4 with PostCSS
- ESLint (next/core-web-vitals, next/typescript)

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
