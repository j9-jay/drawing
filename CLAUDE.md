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
  - `layout.tsx`: Root layout, Geist fonts
  - `page.tsx`: Home page
- **Path alias**: `@/*` → `./src/*`

## Technical Stack

- Next.js 15.5.4 (Turbopack enabled)
- React 19.1.0
- TypeScript 5 (strict mode)
- Tailwind CSS 4 with PostCSS
- ESLint (next/core-web-vitals, next/typescript)
