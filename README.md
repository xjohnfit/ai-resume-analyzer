# AI Resume Analyzer / Job Application Tracker

A personal MERN app: maintain one master profile, generate tailored PDF resumes from it, track job applications individually, and get an AI-generated fit/ATS report per application — grounded in your real experience via retrieval (RAG), so the AI can't invent qualifications.

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
- [ ] **Phase 2 — Profile CRUD** (master resume data, no AI yet)
- [ ] **Phase 3 — PDF generation from profile** (`@react-pdf/renderer`, no AI yet)
- [ ] **Phase 4 — Application tracker CRUD + dashboard** (still no AI)
- [ ] **Phase 5 — LLM fit-scoring** (Claude via LangChain.js, direct prompt, no RAG yet)
- [ ] **Phase 6 — Embeddings + RAG grounding** (OpenAI embeddings + MongoDB Atlas Vector Search)
- [ ] **Phase 7 — Stretch/polish** (status UX, resume version history, cover letters, thumbnails, rate limiting, tests)

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

Requires a `.env` file with: `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, plus (from Phase 5/6 onward) `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.

---

Built with React Router, Express, MongoDB, and LangChain.js.
