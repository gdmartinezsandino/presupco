## Quick context for AI assistants

This repository contains a full-stack application with two primary workspaces:

- `server/` — NestJS backend (Domain modules under `server/src/modules/*`). Key files:
  - `server/src/app.module.ts` (global modules, guards, interceptors, DB setup)
  - `server/src/main.ts` (app bootstrap: global prefix `api/v1`, CORS, Swagger at `/docs`)
  - `server/config/env/example.env` (env keys; copy to `development.env` for local runs)
  - `server/src/templates` (email templates — Handlebars)

- `webapp/` — Angular frontend (generated via Angular CLI). Key files:
  - `webapp/package.json` (dev server: `ng serve`, build/test scripts)
  - Sources in `webapp/src/app` follow feature-module structure.

Docker and scripts:

- `docker-compose.yml` defines a production stack (server, postgres, redis).
- `scripts/dev.sh` is the recommended local dev bootstrap — it starts Redis and runs the backend dev server (`yarn start:dev` in `server/`). The frontend start is commented but present.
- `scripts/prod.sh` (used by README / server README) automates Docker build+up for production.

Primary runtime facts discovered in the codebase (do not assume beyond these):

- API base path: `/api/v1` (see `server/src/main.ts`).
- Swagger docs are served at `/docs` when the server runs (see `server/src/main.ts`).
- The backend registers global guards and interceptors in `AppModule` — check `server/src/common/guards` and `server/src/common/interceptors` before changing auth/role behavior.
- DB: `AppModule` config uses TypeORM/Postgres (see TypeOrmModule.forRootAsync in `server/src/app.module.ts`) and `docker-compose.yml` uses Postgres. The `server/config/env/example.env` also contains Mongo/Mongoose variables — modules may include both ORMs; inspect per-module imports (`@nestjs/typeorm` vs `@nestjs/mongoose`) before changing persistence code.

Developer workflows / commands (concrete examples)

- Local dev (recommended):
  - Copy env: `cp server/config/env/example.env server/config/env/development.env` and set secrets.
  - Start services (recommended script): `./scripts/dev.sh` — this will start Redis (Docker) and run `yarn start:dev` inside `server/`.
  - Or start backend manually: `cd server && yarn install && yarn start:dev`.
  - Start frontend: `cd webapp && yarn install && yarn start` (or `ng serve`).

- Tests & build (server):
  - Unit tests: `cd server && yarn test` (Jest)
  - E2E tests: `cd server && yarn test:e2e` (see `test/`)
  - Build production server: `cd server && yarn build` (outputs `dist/`)

- Docker / production
  - Use `./scripts/prod.sh` or `docker-compose up -d` from repo root. `docker-compose.yml` expects env vars (see example env and `scripts/prod.sh`).

Project-specific conventions and patterns

- Feature modules live under `server/src/modules/<feature>` and follow NestJS conventions: `controllers/`, `services/`, `dto/`, `entities/`, `interfaces/`.
- Global providers (guards/interceptors/logger) are wired in `server/src/app.module.ts`. Prefer changes there for cross-cutting behavior.
- Email templates use Handlebars and are referenced in `AppModule` (template directory `src/templates`), so edits to templates must match existing Handlebars partials usage.
- Environment files: the server expects `config/env/<NODE_ENV>.env` (see `ConfigModule.forRoot` in `app.module.ts`). `scripts/dev.sh` uses `.nvmrc` if present.

Integration / cross-component notes

- API <-> Frontend: frontend expects API at `http://localhost:3000` and WebApp origins are configured via `WEBAPP_URL` in env. CORS is enabled and configured in `server/src/main.ts`.
- Redis is used for caching/session-like features; local dev uses a Docker container launched by `scripts/dev.sh`.
- Mail: mailing config is templated in `AppModule` (MailerModule.forRootAsync) — default transport is a placeholder; real SMTP credentials must be provided in env.

Where to look first when making changes

- Authorization or request-level changes: `server/src/common/guards/*`, `server/src/common/interceptors/*`, `server/src/common/middlewares/*`, and `server/src/app.module.ts`.
- DB or entity work: `server/src/modules/*/entities` and `server/src/app.module.ts` (TypeORM config).
- Email/template changes: `server/src/templates` and `server/src/app.module.ts` (mailer setup).
- Dev bootstrap issues: `scripts/dev.sh`, `server/package.json`, `webapp/package.json`, and `docker-compose.yml`.

Small checklist for common tasks (use before coding):

1. Copy `server/config/env/example.env` → `server/config/env/development.env` and set required values.
2. Confirm Node version: check `server/.nvmrc` or rely on system Node; `scripts/dev.sh` uses nvm when available.
3. Start Redis via `./scripts/dev.sh` (it launches Redis container if missing).
4. Start backend: `cd server && yarn start:dev` and confirm Swagger at `http://localhost:3000/docs`.

If anything above is unclear or you'd like this trimmed/expanded (more examples, or inclusion of module-level notes), tell me what to add and I will iterate.
