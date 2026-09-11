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


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
