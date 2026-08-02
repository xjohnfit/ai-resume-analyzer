# Applyze

An AI-powered resume analyzer and job application tracker (MERN): maintain one master profile, generate tailored PDF resumes from it, track job applications individually, and get an AI-generated fit/ATS report per application — grounded in your real experience via retrieval (RAG), so the AI can't invent qualifications.

Full architecture and phased build plan: see `frontend`/`backend` sections below, and the original plan doc for schema/API/LangChain design details.

## Project structure

```text
react-ai-resume-analyzer/
├── frontend/   # React Router v8 (SSR), Tailwind CSS v4, TypeScript
└── backend/    # Express + TypeScript, MongoDB (Mongoose), LangChain.js
```

## Status

- [x] **Phase 0 — Repo restructure.** Moved the original React Router app into `/frontend`, created `/backend` as a sibling directory, updated `.gitignore` for both workspaces.
- [x] **Phase 1 — Backend scaffold + real JWT auth.** Complete.
  - [x] `backend/` initialized with TypeScript, Express 5, Mongoose, bcrypt, jsonwebtoken, cookie-parser, cors, dotenv, zod.
  - [x] `tsconfig.json` (strict mode, NodeNext, explicit `"types": ["node"]` — required as of TypeScript 7) and `dev`/`build`/`start` npm scripts.
  - [x] Environment config validation (`src/config/env.ts`) — Zod-validated `.env`, fails fast at boot if anything required is missing.
  - [x] MongoDB Atlas connection (`src/config/db.ts`).
  - [x] Express app + entry point (`src/app.ts`, `src/server.ts`) — `GET /api/health` verified working end-to-end (env → DB → server).
  - [x] `User` model (hashed password, hashed/revocable refresh tokens per session).
  - [x] Auth backend complete: `POST /api/auth/signup|login|refresh|logout`, `GET /api/auth/me`. Full cycle verified via curl — signup → protected `/me` → token rotation via `/refresh` → `/logout` → confirmed logged out.
  - [x] Frontend: `login.tsx`, `signup.tsx`, `api.server.ts`/`session.server.ts` (SSR cookie forwarding + `requireUser`). Home route protected and verified in-browser end-to-end.
- [x] **Phase 2 — Subscription billing (Stripe).** Complete. Free tier (3 AI analyses/month) + paid tier ($9/mo or ~$79/yr), Stripe Checkout (hosted) + Billing Portal, embedded on `User` model.
  - [x] Steps 1-2: Stripe Dashboard Product/Prices created; `stripe` SDK installed; `env.ts`/`.env.example` extended with `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_ID_MONTHLY`/`STRIPE_PRICE_ID_YEARLY`; `User.model.ts` extended with `subscription`/`usage` sub-schemas.
  - [x] Step 3: `stripe.service.ts`, `billing.controllers.ts` (`checkout`, `portal`), `billing.routes.ts`, mounted in `app.ts`. Verified via curl — `POST /api/billing/checkout` returns a real Stripe Checkout URL; `POST /api/billing/portal` correctly 400s before a Stripe customer exists.
  - [x] Step 4: Frontend `pricing.tsx` (two `Form`s → `POST /api/billing/checkout` → `redirect()` to Stripe). Verified in-browser — both plan buttons land on the correct hosted Checkout page.
  - [x] Step 5: Real test-mode checkout completed with `4242 4242 4242 4242`; redirected to `/billing?checkout=success`, 404 as expected (`billing.tsx` doesn't exist until step 7).
  - [x] Step 6: Webhook wiring — `app.ts` restructured so `/api/billing/webhook` gets `express.raw()` ahead of the global `express.json()`; `handleStripeWebhook` handles `checkout.session.completed`/`customer.subscription.updated`/`customer.subscription.deleted`. Verified end-to-end with `stripe listen` — real test checkout flips `subscription.status` to `"active"` in MongoDB with correct customer/subscription/price IDs.
  - [x] Step 7: Frontend `billing.tsx` (button → `POST /api/billing/portal` → `redirect()` to Stripe's hosted Billing Portal). Verified in-browser — cancelling a subscription there correctly leaves `status: "active"` with `cancelAtPeriodEnd: true` until period end.
  - [x] Step 8: `usage.service.ts` (`resetUsageIfNeeded`, `isUnderLimit`, `incrementUsage`) + `requireActiveSubscription.middleware.ts` — built but not mounted on any route yet (no analysis endpoint exists until Phase 6). Verified via a throwaway REPL script: 3 free-tier analyses allowed, 4th blocked (402-worthy), backdated `resetAt` correctly zeroes the counter and rolls to next month.
  - [x] Step 9: Extended `GET /api/auth/me` to include `subscription`/`usage` (running `resetUsageIfNeeded` on every call) — additive change, verified via curl that a fresh user gets correct free-tier defaults and existing `id`/`email`/`name` fields are unaffected.
  - **Bugs caught and fixed during testing**: this Stripe SDK version (22.4.0, API `2026-07-29`) moved `current_period_end` from `Subscription` down to each `SubscriptionItem` (`subscription.items.data[0].current_period_end`), and the Billing Portal's "cancel at period end" flow sets a `cancel_at` timestamp rather than the older `cancel_at_period_end: true` boolean — `cancelAtPeriodEnd` is now derived from both signals (`cancel_at_period_end || cancel_at !== null`) to handle either case correctly.
- [x] **UI pass — landing page + routing restructure.** `/` is now a public marketing landing page (`routes/landing.tsx`) describing the app's functionality and pricing; the authenticated app home moved from `home.tsx` at `/` to `routes/dashboard.tsx` at `/dashboard`. Login/signup redirect to `/dashboard`; already-logged-in visitors to `/` are redirected there too. Also fixed a real `.auth-button` overflow bug (fixed `600px` width + `text-3xl` inside a `max-w-sm` card) and added a working logout button (`routes/logout.tsx`, resource route, no UI of its own) wired into `Navbar.tsx`.
- [ ] **Phase 3 — Profile CRUD (+ PDF upload autofill)** (master resume data via manual entry or AI-structured PDF-upload autofill — see plan doc's "Profile PDF upload & autofill" section; this is the one deliberate AI exception in an otherwise AI-free phase)
- [ ] **Phase 4 — PDF generation from profile** (`@react-pdf/renderer`, no AI yet)
- [ ] **Phase 5 — Application tracker CRUD + dashboard** (still no AI)
- [ ] **Phase 6 — LLM fit-scoring** (Claude via LangChain.js, direct prompt, no RAG yet — this is where Phase 2's gating middleware gets wired in)
- [ ] **Phase 7 — Embeddings + RAG grounding** (OpenAI embeddings + MongoDB Atlas Vector Search)
- [ ] **Phase 8 — Stretch/polish** (status UX, resume version history, cover letters, thumbnails, rate limiting, tests)

## Key architecture decisions

- **Auth**: real JWT (access + DB-backed revocable refresh tokens) + bcrypt, from v1.
- **LLM**: Anthropic (Claude) via LangChain.js for all reasoning/writing.
- **Embeddings**: OpenAI `text-embedding-3-small` (Claude has no embeddings API) — used only for the RAG vector store, never for writing.
- **Vector store**: MongoDB Atlas Vector Search — no separate vector DB service. Requires a real Atlas cluster (not local MongoDB) from Phase 1 onward.
- **PDF generation**: `@react-pdf/renderer`, rendered server-side in `backend/`.
- **Client state**: Zustand for ephemeral UI/form state only (auth cache, form drafts, multi-step flows) — persisted data always lives in MongoDB via the API.

## Frontend

React Router v8 (SSR via `@react-router/serve`), React 19, Tailwind CSS v4, TypeScript.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build
npm run typecheck
```

## Backend

Express + TypeScript, MongoDB via Mongoose, LangChain.js (Anthropic + OpenAI embeddings).

```bash
cd backend
npm install
npm run dev         # tsx watch, http://localhost:5000
npm run build        # tsc -> dist/
npm run start        # node dist/server.js
```

Requires a `.env` file with: `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, plus (from Phase 2 onward) `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`, and (from Phase 6/7 onward) `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.

---

Built with React Router, Express, MongoDB, and LangChain.js.
