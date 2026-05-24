# Qapybara

New app foundation with a self-host-ready stack.

Stack:

- Next.js App Router + TypeScript
- Prisma + Postgres
- Tailwind CSS + shadcn/ui
- Biome (format + lint)
- Vitest + Testing Library
- Playwright
- GitHub Actions (CI)
- Docker Compose for one-command local/self-host setup

## Quick Start (Docker)

1. Create your environment file.

```bash
cp .env.example .env
```

2. Start database and app.

```bash
docker compose up --build -d
```

3. Apply Prisma migrations.

```bash
docker compose exec app npm run prisma:migrate:deploy
```

4. Open the app and health endpoint.

- http://localhost:3000
- http://localhost:3000/api/health

## Local Development (without Docker)

1. Start Postgres locally and set DATABASE_URL in .env.local.
2. Install dependencies.

```bash
npm install
```

3. Generate Prisma client and run migrations.

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

4. Run dev server.

```bash
npm run dev
```

## Quality Commands

```bash
npm run lint
npm run lint:fix
npm run format
npm run lint:eslint
```

## Testing

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e:install
npm run test:e2e
```

## CI

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Jobs:
  - quality (prisma generate, biome, vitest, build)
  - e2e (playwright)

## Prisma Commands

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio
```

## Notes for Self-Hosting

- This repository uses `next build` with `output: "standalone"`.
- Runtime secrets are loaded at container startup via environment variables.
- Keep `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` consistent across replicas.
- Put a reverse proxy (for example nginx or Caddy) in front for TLS and rate limiting.
