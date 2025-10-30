# NVN Finance Terminal

Monorepo containing frontend (Next.js) and backend (Go/Gin + Postgres).

## Prerequisites
- Node 18+ and pnpm
- Go 1.22+
- PostgreSQL 14+

## Structure
- backend/ — Gin API exposing /candles/latest, /candles/range, /signals
- frontend/ — Next.js app

## Environment
Create env files from the provided examples:

- backend/.env
```
DATABASE_URL=postgres://user:pass@localhost:5432/market?sslmode=disable
FRONTEND_ORIGINS=http://localhost:3000
PORT=8080
```

- frontend/.env
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Backend
Apply migrations then run API.

```
# From backend/
# Use your migration tool or psql to apply migrations in db/migrations
# Example (psql):
# psql "$DATABASE_URL" -f db/migrations/0001_init.up.sql
# psql "$DATABASE_URL" -f db/migrations/0002_seed_frontend_indices.up.sql
# psql "$DATABASE_URL" -f db/migrations/0003_seed_more_symbols.up.sql

go run ./cmd/api
```

## Frontend
```
# From frontend/
pnpm install
pnpm dev
```
Visit http://localhost:3000.

## Notes
- Data is fetched from the backend. If symbols have no candles yet, UI will show zeros.
- Simple 10s in-memory caching and request deduping are enabled in frontend `lib/api.ts`.

## CI
GitHub Actions runs backend build/test and frontend build on PRs and pushes to main.
