# FitPreview — Virtual Try-On (MVP)

Web app for overseas consumers: upload your photo + a garment image, get an AI try-on preview before buying online.

Based on [virtual-try-on-product-spec.md](../virtual-try-on-product-spec.md).

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- pnpm (required)
- Volcengine Ark / Doubao Seedream image-to-image API (or mock mode)
- **Neon Postgres** + Drizzle ORM (`@neondatabase/serverless`)
- React Context (`TryOnProvider`)

## Quick start

```bash
cd virtual-try-on
pnpm install
cp .env.example .env.local
# Add ARK_API_KEY from Volcengine Ark console — or set TRY_ON_MOCK=true
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## MVP features

- Upload & save **your photo** (localStorage)
- Upload **garment image** + category (top / bottom / dress)
- AI try-on via **Ark Seedream** (`doubao-seedream-5-0-260128`)
- **Download** result (P0)
- **Try another garment** without re-uploading your photo
- **History** (localStorage, per device)
- **Quota**: 1 try-on/month guest · 5/month after “Sign in (demo)”
- No payment (per SPEC)

## Environment

| Variable | Description |
|----------|-------------|
| `ARK_API_KEY` | Volcengine Ark API bearer token |
| `ARK_API_BASE` | Default: `https://ark.cn-beijing.volces.com/api/v3` |
| `ARK_MODEL` | Default: `doubao-seedream-5-0-260128` |
| `TRY_ON_MOCK` | `true` = skip API, return your photo as demo |
| `TRY_ON_TIMEOUT_MS` | Request timeout (default `90000`) |
| `DATABASE_URL` | Neon Postgres connection string (pooled) |
| `NEON_PROJECT_ID` | Neon project id (default `purple-field-07835895`) |
| `NEON_ORG_ID` | Neon org id |

## Database (Neon + Drizzle)

Project: **AI Course** · Org: `org-orange-mud-32787980` · Project: `purple-field-07835895`

```bash
pnpm db:generate   # after schema changes
pnpm db:migrate    # apply migrations to Neon
pnpm db:studio     # Drizzle Studio UI
```

Health check: `GET /api/health/db` → `{ "ok": true, "provider": "neon", ... }`

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Registered users (Phase 2 auth) |
| `personas` | Saved "my look" photos |
| `try_on_records` | Try-on history |
| `monthly_usage` | Server-side quota tracking |

App still uses localStorage for MVP UI; DB is ready for persistence migration.

## Project structure

```
src/
  app/              # pages + API routes
  components/       # UI + try-on studio
  context/          # TryOnProvider (global state)
  services/try-on/  # Ark API service layer
  db/               # Drizzle schema + Neon client
  lib/              # quota, storage helpers
```

## Phase 2 (not in MVP)

- Google / Apple auth (real)
- Server-side history sync
- Stripe subscriptions
- Product URL scraping
