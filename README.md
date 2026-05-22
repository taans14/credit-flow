# Credit Flow

A small full‑stack “credits” platform that demonstrates a SaaS-style credit wallet + feature gating model.

- **Client**: React + TypeScript (Vite)
- **Server**: NestJS + Prisma
- **Database**: Postgres
- **Infra**: Docker Compose

## What this project does

Credit Flow models a common pattern for SaaS products:

- Users authenticate and receive JWT-based access (and refresh) tokens
- Users have a **wallet** with a **credit balance**
- Credits can be purchased via **credit packages**
- Features have a **credit cost** and can be guarded server-side
- The API exposes a Swagger UI for quick exploration

## Repository structure

- [client/](client/) — React UI (Vite)
- [server/](server/) — NestJS API + Prisma schema/migrations/seed
- [docker-compose.yml](docker-compose.yml) — orchestrates Postgres + API + UI

## Running with Docker (recommended)

### Prerequisites

- Docker Engine / Docker Desktop
- Docker Compose v2 (`docker compose`)

### 1) Check environment variables

This repo uses three `.env` files:

- [.env](.env) — Postgres container settings (used by the `db` service)
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`

- [server/.env](server/.env) — API settings
  - `PORT` — API port (Compose maps `3000:3000` by default)
  - `DATABASE_URL` — points to the Compose Postgres service (host is `db`)
  - `CLIENT_URL` — allowed CORS origin (default is `http://localhost:5173`)
  - `JWT_SECRET`, `JWT_EXPIRATION_TIME`
  - `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRATION_TIME`

- [client/.env](client/.env) — UI settings
  - `VITE_API_URL` — API base URL used by the browser (default is `http://localhost:3000`)

Notes:
- The current `client` Docker image also bakes `VITE_API_URL` at build time via a Compose build arg.
- For production usage, you should replace JWT secrets with strong values and avoid committing secrets.

### 2) Build and start

From the repo root:

```bash
docker compose up --build
```

Once everything is up:

- UI: http://localhost:5173
- API: http://localhost:3000
- Swagger docs: http://localhost:3000/api
- Postgres: localhost:5432

### 3) Stop / reset

Stop containers:

```bash
docker compose down
```

Stop containers and wipe the Postgres volume (fresh DB):

```bash
docker compose down -v
```

### Important: database seeding behavior

The server container currently runs migrations and **seeds on every start**:

- it executes `prisma migrate deploy`
- then runs the Prisma seed script

The seed script clears tables before inserting demo data. This is great for demos, but it means restarting the server can reset your data.

If you want data to persist across restarts, remove the seed step from the server container command in [server/Dockerfile](server/Dockerfile).

## Local development (without Docker)

If you prefer running things directly (optional):

- Start Postgres (or use the Compose `db` service)
- In [server/](server/): `pnpm install` then `pnpm run start:dev`
- In [client/](client/): `pnpm install` then `pnpm run dev`

## Troubleshooting

- **Port already in use**: ensure ports `5173`, `3000`, and `5432` are free (or change the mappings in [docker-compose.yml](docker-compose.yml)).
- **CORS errors**: make sure `CLIENT_URL` in [server/.env](server/.env) matches the UI origin.
- **DB connection issues**: `DATABASE_URL` in [server/.env](server/.env) must use host `db` when running via Compose.
