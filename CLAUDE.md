# CLAUDE.md — QBTECH.backend

Context for AI agents working in this repo. Read this first. For cross-repo context see the workspace `../CLAUDE.md`.

## What this is

NestJS 11 REST API for **QBTECH**, an e-learning platform (roles: **admin**, **educator**, **learner**). Based on the brocoders **nestjs-boilerplate**. Architecture is **hexagonal** — do not flatten it.

- Runtime: Node ≥16, TypeScript (strict). Stack: NestJS 11, TypeORM 0.3 (Postgres), Mongoose 9 (optional document mode), Passport + JWT, class-validator/class-transformer, Swagger, nestjs-i18n, AWS S3 for files.

## API shape (the contract the frontend consumes)

- Base URL: `http://localhost:4000`
- Global prefix `api` + **URI versioning** → all routes are `/api/v1/...` (controllers set `version: '1'`)
- Swagger / OpenAPI: **`http://localhost:4000/docs`** — source of truth for DTOs and error shapes
- CORS enabled (`main.ts`)
- Global `ValidationPipe`; validation errors return `{ status, errors: { field: message } }`
- `ClassSerializerInterceptor` + `@SerializeOptions({ groups: [...] })` control response shaping — respect serialization groups (e.g. `'me'`) when adding fields.

### Auth (`/api/v1/auth`) — JWT access + separate refresh
- `POST email/login` → `{ token, refreshToken, tokenExpires, user }`
- `POST email/register`, `email/confirm`, `password/forgot`, `password/reset`
- `GET  me` — Bearer **access** token (`AuthGuard('jwt')`)
- `POST refresh` — Bearer **refresh** token, NOT the access token (`AuthGuard('jwt-refresh')`)
- `POST logout` → 204
- OAuth: `POST oauth/:provider` (google / facebook / apple modules)

## Module conventions (hexagonal)

Features: `users`, `courses`, `enrollments`, `categories`, `certificates`, `faqs`, `files`, `roles`, `statuses`, `session`, `home`. Each follows:
```
feature/
  domain/                              # framework-agnostic domain model (e.g. course.ts)
  dto/                                 # request/response DTOs (class-validator)
  infrastructure/persistence/
    <feature>.repository.ts            # abstract repository PORT
    relational/                        # TypeORM adapter
      entities/  mappers/  repositories/  relational-persistence.module.ts
    document/                          # Mongoose adapter (when used)
  feature.controller.ts  feature.service.ts  feature.module.ts
```
Rules:
- Services depend on the **abstract repository port**, never on TypeORM/Mongoose directly. Mappers convert entity ↔ domain.
- **Scaffold with the generators** — don't hand-roll the folder tree:
  - `npm run generate:resource:relational` (default) / `:document` / `:all-db`
  - `npm run add:property:to-relational` to add fields
  - Seeds: `npm run seed:create:relational`
- Default DB mode is **relational** (Postgres, port 5432). Document mode exists but isn't the default.

## Commands

```
npm run start:dev            # watch mode, port 4000
npm run lint                 # eslint — must pass before done
npm run migration:generate -- src/database/migrations/<Name>   # AFTER entity changes
npm run migration:run
npm run migration:revert
npm run seed:run:relational
npm run test  /  npm run test:e2e
```

- Env in `.env` (copy from `env-example-relational`). Key vars: `APP_PORT=4000`, `API_PREFIX=api`, `DATABASE_*`, JWT secrets, `MAIL_*`, AWS S3.
- **Never edit the DB by hand.** After changing an entity, generate a migration and run it. `postmigration:generate` auto-runs `lint --fix`.
- Seeds live in `src/database/seeds/relational/<feature>/`.

## Working agreements

- TypeScript strict, **no `any`**; `npm run lint` must pass.
- Match existing patterns — read a sibling feature (e.g. `courses/`) before adding one.
- Keep `domain` framework-agnostic; keep persistence behind the port.
- Respect serialization groups so you don't leak fields in responses.
- Don't change the public API shape to suit the frontend unless asked — frontend consumes `/docs` as-is.
- Never commit secrets (`.env`).
