# LarpTech — AI Solutions Platform

> **One AI partner across every revenue-driving function**: marketing, sales, agents, security, e-commerce and trading.

---

## Project Structure

This repository is split into two independently-runnable applications that communicate over HTTP:

```
larptech-sample-checking/
├── backend/        ← Node.js + Express API server  (port 4000)
├── frontend/       ← Next.js 16 web application    (port 3000)
├── package.json    ← Root: runs both via concurrently
└── README.md
```

### Backend (`/backend`)

| Path | Description |
|---|---|
| `src/index.ts` | Express app entry point (CORS, JSON body parsing, route mounting) |
| `src/routes/health.ts` | `GET /api/health` — DB liveness check |
| `src/routes/leads.ts` | `POST /api/leads` — Contact form lead capture |
| `src/db/index.ts` | Drizzle ORM + PostgreSQL pool |
| `src/db/schema.ts` | `leads` table schema |
| `src/lib/email.ts` | Resend email notification (best-effort) |
| `src/lib/validators.ts` | Zod schema for lead payload validation |

### Frontend (`/frontend`)

| Path | Description |
|---|---|
| `src/app/(marketing)/` | All public pages (home, about, services, contact, pricing…) |
| `src/components/` | Shared UI components (Navbar, Footer, ContactForm, etc.) |
| `src/lib/analytics.ts` | GA4 analytics shim |
| `src/lib/services.ts` | Service definitions and metadata |
| `src/lib/validators.ts` | Zod schema (duplicated — used for client-side form validation) |

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** running locally (or a hosted connection string)
- (Optional) A [Resend](https://resend.com) API key for email notifications

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `PORT` | ❌ | `4000` | Express server port |
| `FRONTEND_ORIGIN` | ❌ | `http://localhost:3000` | Allowed CORS origin |
| `RESEND_API_KEY` | ❌ | — | Resend API key for email alerts |
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

### 3. Push the database schema

```powershell
# Run from the backend folder
cd backend
npx drizzle-kit push
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

The project uses **Drizzle ORM** with **PostgreSQL**.

```powershell
# Push schema changes to the database
cd backend
npx drizzle-kit push
cd ..

# Open Drizzle Studio (visual DB browser)
cd backend
npx drizzle-kit studio
```

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
| Validation | Zod (shared schema, duplicated in both projects) |
| Email | Resend (optional, best-effort) |
| Analytics | Google Analytics 4 (optional) |
| Dev runner | concurrently |

---

## Contact

📧 [team@larptech.io](mailto:team@larptech.io)  
🌐 [larptech.io](https://larptech.io)
