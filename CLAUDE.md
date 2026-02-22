# CLAUDE.md

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # Start with file watching
npm run start:debug     # Start with debug + watch

# Build
npm run build           # Compile TypeScript via nest build

# Testing
npm run test            # Run unit tests (Jest)
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run e2e tests using test/jest-e2e.json
npm run test:cov        # Run tests with coverage report

# Run a single test file
npx jest src/products/products.service.spec.ts

# Linting / formatting
npm run lint            # ESLint with auto-fix
npm run format          # Prettier format

# Database (local dev)
docker compose up -d db  # Start Postgres 12 on port 5432
```

## Environment Variables

The app requires these env vars (use a `.env` file via `@nestjs/config`):

| Variable | Description |
|---|---|
| `DB_TYPE` | TypeORM driver type (e.g. `postgres`) |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `INVOICE_URL` | Endpoint for the external invoice parsing service |
| `NODE_ENV` | Set to `development` to disable authentication guard |

Local Postgres defaults (from `docker-compose.yml`): user/password/db all `postgres`, port `5432`.

## Architecture

This is a NestJS + TypeORM + PostgreSQL REST API. The domain models are **products**, **sales**, **stores**, and **auth**.

### Authentication

`SupabaseGuard` (JWT via `passport-jwt`) is applied globally as `APP_GUARD` — all routes require authentication **except in `development` mode** (`NODE_ENV=development` skips the guard entirely). Individual routes can opt out of auth with the `@Public()` decorator (`src/decorators/public.decorator.ts`).

Currently `GET /products` and `GET /products/:id` are marked `@Public()`. All write endpoints require auth.

### Request / Response Flow

1. **PagerMiddleware** (`src/middleware/pager.middleware.ts`) normalizes `?limit` and `?page` query params (defaults: `limit=10`, `page=1`) for `GET /products` and `GET /sales`.
2. **TransformInterceptor** (`src/shared/transform-interceptor.ts`) wraps all responses: arrays become `{ success, result, total }`, objects become `{ success, result }`.
3. **SortingParams** decorator (`src/decorators/sorting-params.decorator.ts`) parses a `?sort=field:asc|desc` query param and validates against an allowed field list.

### Sales / Invoice Ingestion

`POST /sales` accepts an invoice URL. `SalesService.create()` calls the external `INVOICE_URL` service via `InvoiceService` (HTTP POST), parses the response into `InvoiceData`, then:
1. Creates or finds a `Store`
2. Saves the `Sale`
3. Creates `Product` records (upsert-by-code for EAN-coded items) with `PriceHistory` entries

Products with an 8- or 13-digit code are treated as EAN; on re-import only a new `PriceHistory` row is added.

### Coverage Requirements

Jest is configured with **80% threshold** on branches, functions, lines, and statements. Coverage is excluded for `.module.ts`, `main.ts`, `index.ts`, `dto.ts`, `entity.ts`, `src/users/`, and `src/shared/supabase`.
