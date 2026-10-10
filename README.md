# LarpTech — AI Solutions Platform

> **One AI partner across every revenue-driving function**: marketing, sales, agents, security, e-commerce and trading.

---

## Project Structure

This repository is split into two independently-runnable applications that communicate over HTTP:

```
larptech-sample1/
├── backend/        ← Node.js + Express API server  (port 4000)
├── frontend/       ← Next.js 16 web application    (port 3000)
├── render.yaml     ← Render Blueprint for the backend (see "Production Deployment")
├── package.json    ← Root: runs both via concurrently
└── README.md
```

### Backend (`/backend`)

| Path | Description |
|---|---|
| `src/index.ts` | Bootstrap: env validation, listen, graceful shutdown, outbox worker |
| `src/app.ts` | Express app graph: CORS, JSON parsing, rate limits, security headers |
| `src/routes/health.ts` | `GET /api/health` — DB liveness check (Render healthCheckPath) |
| `src/routes/leads.ts` | `POST /api/leads` — Contact form lead capture |
| `src/routes/waitlist.ts` | `POST /api/waitlist` — Product waitlist signup |
| `src/db/index.ts` | Drizzle ORM + PostgreSQL pool (TLS pinned to `verify-full`) |
| `src/db/schema.ts` | `leads`, `waitlist`, `lead_notifications` schema |
| `src/db/migrate.ts` | Idempotent SQL migration runner (`npm run db:migrate`) |
| `src/lib/outbox.ts` | Transactional outbox worker for team notification emails |
| `src/lib/outboxSender.ts` | Resend send with bounded timeout + idempotency keys |
| `src/lib/email.ts` | Resend email client |
| `src/lib/env.ts` | Environment validation — fails closed on misconfiguration |
| `src/lib/validators.ts` | Zod schema for lead payload validation |

### Frontend (`/frontend`)

| Path | Description |
|---|---|
| `src/app/(marketing)/` | All public pages (home, about, services, contact, pricing…) |
| `src/components/` | Shared UI components (Navbar, Footer, ContactForm, etc.) |
| `src/lib/analytics.ts` | GA4 analytics shim — fires only after explicit consent |
| `src/lib/services.ts` | Service definitions and metadata |
| `src/lib/validators.ts` | Zod schema for client-side form validation (kept in sync with the backend by `validatorParity.test.ts`) |

---

## Prerequisites

- **Node.js** ≥ 22 (`backend/package.json` and `frontend/package.json` both pin `engines: >=22`)
- **PostgreSQL** running locally (or a hosted connection string)
- (Optional) A [Resend](https://resend.com) API key for email notifications

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string (TLS `verify-full` against remote hosts) |
| `PORT` | ❌ | `4000` | Express server port |
| `FRONTEND_ORIGIN` | ✅ (prod) | — | Allowed CORS origin(s), comma-separated. **Required in production** — there is no silent localhost default; an unset value fails startup |
| `RESEND_API_KEY` | ❌ | — | Resend API key for team notification emails. If unset in production, startup logs a warning: leads are stored but nobody is emailed |
| `EMAIL_FROM` | ❌ | `LarpTech Leads <leads@larptech.io>` | Sender address |
| `LEAD_INBOX_EMAIL` | ❌ | `team@larptech.io` | Lead notification recipient |

### Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` → `frontend/.env.local` and fill in:

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:4000` | Backend API base URL |
| `NEXT_PUBLIC_GA_ID` | ❌ | — | Google Analytics 4 Measurement ID |
| `NEXT_PUBLIC_SITE_URL` | ❌ | `https://larptech.io` | Canonical site URL |

---

## Production Deployment

### Env vars

- **Vercel (frontend)**: `NEXT_PUBLIC_API_URL` (required at build time — `next build` fails without it), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID` (optional; enables the consent-gated GA4 loader)
- **Render (backend)**: `DATABASE_URL`, `FRONTEND_ORIGIN` (required — must exactly match the live frontend origin or CORS blocks every form submission), `RESEND_API_KEY` (optional)

### Render blueprint (`render.yaml`)

The backend deploys from `render.yaml`. Two behaviours matter for a working deploy:

- **`preDeployCommand: npm run db:migrate`** applies SQL migrations after the build
  and before traffic switches. The runner is idempotent, so it is safe on every
  deploy. Without it, a fresh database has no `lead_notifications` table: every
  form submission returns 500 while `GET /api/health` still reports healthy.
- **`healthCheckPath: /api/health`** — the default `/` returns 404 because the API
  has no root route.

**Do not set `NODE_ENV` in `render.yaml`.** Render already runs Node services with
`NODE_ENV=production` at runtime. Setting it in the blueprint also applies it during
the build, which makes npm skip devDependencies — and `npm run db:migrate` runs
through `tsx`, a devDependency. The deploy then fails with `tsx: not found`.

---

## Getting Started

### 1. Install all dependencies

```bash
# 1. Install all dependencies (once)
npm run install:all
```

### 2. Set up environment variables

```powershell
# Backend — copy and edit, set DATABASE_URL
copy backend\.env.example backend\.env

# Frontend — copy (defaults work for local dev)
copy frontend\.env.example frontend\.env.local
```

### 3. Apply the database schema

```powershell
# Run from the backend folder
cd backend
npm run db:migrate
cd ..
```

### 4. Run both servers simultaneously

```powershell
# From the project root (not inside backend/ or frontend/)
npm run dev
```

This starts:
- 🟦 **Backend** → `http://localhost:4000`
- 🟣 **Frontend** → `http://localhost:3000`

Output will be colour-coded: **BACKEND** in cyan, **FRONTEND** in magenta.

---

## Running Individually

### Backend only

```powershell
cd backend
npm run dev
```

### Frontend only

```powershell
cd frontend
npm run dev
```

---

## API Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `http://localhost:4000/api/health` | Database liveness check → `{"ok": true}` |
| `POST` | `http://localhost:4000/api/leads` | Submit contact form lead |

### POST `/api/leads` — Request Body

```json
{
  "name": "Ada Lovelace",
  "email": "ada@company.com",
  "company": "Analytical Engines Ltd.",
  "serviceInterest": "ai-agents",
  "message": "We need help automating our invoicing workflow."
}
```

**`serviceInterest`** must be one of:
`marketing-ai` | `sales-ai` | `ai-agents` | `security-mssp` | `ecommerce-ai` | `trading-ai` | `not-sure`

### Responses

| Status | Description |
|---|---|
| `201` | Lead saved, `{ ok: true, id: "..." }` |
| `400` | Malformed JSON |
| `422` | Validation error, `{ message: "...", fieldErrors: { ... } }` |
| `500` | Database error |

---

## Database

The project uses **Drizzle ORM** with **PostgreSQL**. Schema changes are applied as
version-controlled SQL migrations in `backend/drizzle/`, not by pushing the schema directly.

```powershell
cd backend

# Apply any pending migrations (safe to re-run; already-applied ones are skipped)
npm run db:migrate

# Generate a migration after editing src/db/schema.ts
npm run db:generate

# Show which migrations are pending
npm run db:status

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

#### Changing the schema

1. Edit `backend/src/db/schema.ts`.
2. Run `npm run db:generate` and review the SQL that was produced. Generated migrations are
   a starting point, not gospel — add any data backfill they need, and check the ordering:
   a constraint cannot be created while rows violate it.
3. Commit the generated `.sql` file alongside your code change. The migration is part of the
   change; shipping code that assumes a column or constraint without it breaks any
   environment that has not been migrated by hand.

#### Adopting migrations on an existing database

Databases created earlier with `drizzle-kit push` have the schema but no record of it. The
baseline migration `0000_init.sql` is written to be idempotent, so `npm run db:migrate` on
such a database records it as already applied and then applies later migrations normally —
no rebuild required.

`npm run db:push` still exists for scratch databases, but do not point it at shared or
production environments: it infers the diff live and can drop columns with data in them.

## Lead notifications

The team email is **not** sent inside the `POST /api/leads` request. The lead and a row in
`lead_notifications` are written in a single transaction, and a background worker delivers
them.

This matters because the notification is the difference between a lead being worked and a
lead being forgotten. Sending it inline made that depend on a third-party API being healthy
at the exact moment a visitor pressed submit — and a transient Resend failure silently lost
the notification while the lead sat unseen.

How it behaves:

- **Bounded.** `RESEND_TIMEOUT_MS` (default 5s) caps the whole request. A hung provider can
  no longer hold a visitor's browser open.
- **Retried.** Transient failures (timeouts, 5xx, 429) are retried with exponential backoff
  and jitter. Permanent ones (401, 422) stop immediately rather than burning the retry budget.
- **Not duplicated.** Each notification carries a Resend `Idempotency-Key` derived from its
  own id, so a retry after a timeout the provider had already accepted returns the original
  result instead of sending a second email.
- **Crash safe.** Claimed rows hold a lease in `locked_at`; a row still marked `sending`
  after `OUTBOX_LEASE_MS` is reclaimed by the next tick.
- **Safe to scale.** Rows are claimed with `FOR UPDATE SKIP LOCKED`, so running more than one
  backend process will not deliver the same notification twice.

Setting `OUTBOX_ENABLED=0` disables the worker: leads are still stored, but nobody is emailed.

A notification that exhausts its attempts is marked `failed` with the reason in `last_error`:

```sql
select id, lead_id, attempts, last_error
from lead_notifications
where status = 'failed'
order by updated_at desc;
```

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull request. It has two
jobs.

**Backend** runs against a real PostgreSQL 16 service container:

| Step | Why it is there |
|---|---|
| `npm ci` | Installs exactly what the lockfile pins. Refuses to run if `package.json` and the lockfile disagree. |
| Apply migrations to an *empty* database | The step that catches a missing, broken or untracked migration before it reaches a deploy. |
| Apply migrations a second time | Migrations must be re-runnable; this is what makes a deploy safe to repeat. |
| `npm run typecheck` | |
| `npm test` | Unit tests, no database needed. |
| `npm run test:integration` | Database-backed tests (migrations, de-duplication, the outbox). |
| `npm run build` | |
| `npm audit --omit=dev --audit-level=high` | Fails on a new high or critical advisory in shipped dependencies. |

**Frontend** runs `npm ci`, typecheck, lint, build and the same audit.

### Running the tests locally

```powershell
# Unit tests — no database required
npm test --prefix backend

# Database-backed tests — needs a disposable PostgreSQL
$env:TEST_DATABASE_URL = "postgresql://postgres@localhost:5432/larptech_test"
npm run test:integration --prefix backend

# Both
npm run test:all --prefix backend
```

The integration tests skip themselves when `TEST_DATABASE_URL` is unset, so `npm test`
stays runnable without one.

### Dependency updates

Both lockfiles were generated with npm 11+. Regenerate them with
`npm install --package-lock-only` rather than a plain `npm install`, which prunes the
optional platform-specific packages (the `sharp` binaries for macOS and Windows) and would
break `npm ci` for developers on those platforms.

---

## Production Build

```powershell
npm run build
```

Builds both backend (`tsc`) and frontend (next build).

To start in production:

```powershell
# Backend
cd backend
npm start
cd ..

# Frontend
cd frontend
npm start
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Validation | Zod (mirrored frontend/backend schemas, parity-tested) |
| Email | Resend (optional) — transactional outbox delivery with retries |
| Analytics | Google Analytics 4 (optional) |
| Dev runner | concurrently |

---

## Contact

📧 [team@larptech.io](mailto:team@larptech.io)  
🌐 [larptech.io](https://larptech.io)
