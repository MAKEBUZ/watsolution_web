# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**watsolution** is a water management system (Sistema de Gestión de Agua) generated with JHipster 8.10.0 using the NHipster (NodeJS) blueprint. It is a monolith with:
- **Backend**: NestJS 11 + TypeORM 0.3 + PostgreSQL (or SQLite for dev/test)
- **Frontend**: Vue 3 + Pinia + Vue Router + Bootstrap 4 / bootstrap-vue
- **Auth**: JWT via `passport-jwt`
- **API docs**: Swagger at `/api/v2/api-docs`

The project uses npm workspaces: root → `server/` and `client/`.

## Commands

### Development (full stack)
```bash
npm run docker:db:up       # Start PostgreSQL via Docker (needed for dev mode)
npm start                  # Run server + client concurrently (hot reload)
npm run start:server       # Server only (ts-node, watches src/)
npm run start:client       # Client only (Vite dev server)
```

### Build
```bash
npm run build              # Build both server (tsc) and client (Vite)
npm run build:app          # Server only
npm run webapp:build       # Client only
```

### Testing
```bash
npm run test:server        # Jest tests (server), runs lint first
npm run test:client        # Vitest tests (client), runs lint first
npm run test:server:e2e    # E2E tests with Jest (needs running DB)
npm run test -w server -- --testPathPattern=address   # Single test file
npm run vitest-run -w client                          # Client tests with coverage
```

### Linting / Formatting
```bash
npm run lint -w server     # ESLint on server
npm run lint -w client     # ESLint on client
npm run prettier:check     # Check formatting
npm run prettier:format    # Auto-format
```

### Database
```bash
npm run docker:db:up       # Start PostgreSQL container
npm run docker:db:down     # Stop and remove PostgreSQL container
```

## Architecture

### Backend (`server/src/`)

The server follows the NestJS module pattern. Each domain entity has its own module, controller, service, entity, DTO, and mapper:

```
module/          # NestJS module definitions (one per entity + auth + user)
domain/          # TypeORM entity classes
web/rest/        # REST controllers (one per entity)
service/         # Business logic services
service/dto/     # Request/response DTOs with class-validator decorators
service/mapper/  # Entity ↔ DTO mappers
security/        # JWT strategy, guards, password utils, role types
migrations/      # TypeORM migrations (CreateTables + SeedUsersRoles)
config/          # application.yml + per-env overrides (dev/test/prod)
```

**Environment switching** is controlled by `BACKEND_ENV` (set in `server/.env`):
- Default (unset): SQLite at `target/db/sqlite-dev-db.sql`
- `dev`: PostgreSQL at `127.0.0.1:5432` (requires `docker:db:up`)
- `test`: SQLite in-memory (schema auto-synced, no migrations needed)
- `prod`: PostgreSQL at host `postgresql` (Docker service name)

Config loads `application.yml` + `application-{BACKEND_ENV}.yml` at startup via `config.ts`.

**Adding a new entity** — follow the JHipster needle comments:
- Register it in `orm.config.ts` (entities array + import)
- Add its module to `app.module.ts`
- Add migrations or rely on `synchronize: true` (only safe in test env)

### Frontend (`client/src/app/`)

Vue 3 SPA served as static files from `server/dist/static/` in production (NestJS `ServeStaticModule`). In development, Vite runs independently on a separate port and proxies API calls.

```
entities/        # CRUD views per entity (list, detail, update + specs)
core/            # Navbar, footer, ribbon, home
shared/model/    # TypeScript interfaces for domain models
shared/security/ # Auth composables, login redirect
router/          # Vue Router routes split by area (account, admin, entities, pages)
store.ts         # Pinia store (root)
```

Each entity folder (`address/`, `person/`, `meter/`, `invoice/`, `user/`) contains:
- `<entity>.vue` + `<entity>.component.ts` — list view
- `<entity>-details.vue/.ts` — read-only detail view
- `<entity>-update.vue/.ts` — create/edit form (uses Vuelidate)
- `<entity>.service.ts` — Axios HTTP calls to `/api/<entity>s`
- `*.spec.ts` — Vitest unit tests per component/service

### Domain Model

Defined in [schema.jdl](schema.jdl):

```
Address ← Person (ManyToOne)
Person  ← Meter  (ManyToOne)
Address ← Meter  (ManyToOne)
Person  ← Invoice (ManyToOne)
Meter   ← Invoice (ManyToOne)
```

Enums: `PersonStatus` (ACTIVE/INACTIVE), `InvoiceStatus` (PENDING/PAID/CANCELLED).

### Authentication Flow

1. Client POSTs credentials to `POST /api/authenticate` → receives JWT
2. JWT stored client-side; sent as `Authorization: Bearer <token>` header
3. Server validates via `PassportJwtStrategy`; roles enforced via guards in `security/guards/`
4. Default seeded users are created by migration `SeedUsersRoles1570200490072`

## Key Configuration Files

| File | Purpose |
|------|---------|
| `server/.env` | `BACKEND_ENV` and `DATABASE_URL` (not committed in prod) |
| `server/src/config/application.yml` | Base config (JWT secret, server port, Swagger path) |
| `server/src/config/application-dev.yml` | Dev overrides |
| `server/src/orm.config.ts` | TypeORM setup, entity list, migrations |
| `client/vite.config.ts` | Vite build + dev server (API proxy) |
| `docker/postgresql.yml` | PostgreSQL Docker Compose (dev) |
| `docker/app.yml` | Full app Docker Compose (prod) |
