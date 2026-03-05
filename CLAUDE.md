# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AutoNote — веб-приложение для учёта расходов на автомобиль. Монорепо с npm workspaces.

## Architecture

- `apps/client` — React + Vite + TypeScript (port 5173)
- `apps/server` — NestJS + TypeScript (port 3001, prefix `/api`)
- `packages/shared` — общие типы (Vehicle, Category, Expense)
- Prisma ORM (v6) + PostgreSQL, БД `autonote`

## Commands

```bash
# Dev
npm run dev:client          # Vite dev server (port 5173)
npm run dev:server          # NestJS watch mode (port 3001)
docker compose up -d        # PostgreSQL (port 5432)

# Build
npm run build:client
npm run build:server

# Database
npm run db:migrate          # prisma migrate dev
npm run db:generate         # prisma generate
npm run db:studio           # prisma studio

# Lint
npm run lint

# Tests (server)
cd apps/server && npm test           # unit tests
cd apps/server && npm run test:e2e   # e2e tests
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite |
| UI | shadcn/ui + Tailwind CSS v4 |
| Data fetching | TanStack Query |
| Client state | Zustand |
| Routing | React Router |
| HTTP client | Axios (via `/api` proxy in dev) |
| Backend | NestJS |
| ORM | Prisma v6 |
| DB | PostgreSQL 16 |
| Validation | class-validator + class-transformer |

## Conventions

- Prisma models use `@@map()` for snake_case table names, camelCase fields
- Backend API prefix: `/api`
- Client path alias: `@/` → `apps/client/src/`
- shadcn/ui components: `apps/client/src/components/ui/`
- Tailwind v4: use `@theme inline` in index.css, no tailwind.config
- CSS variables for theming (shadcn pattern with HSL values)
- Prisma schema: `apps/server/prisma/schema.prisma`
- Server env: `apps/server/.env` (copy from `.env.example`)
