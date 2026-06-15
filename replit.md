# SecurAI-Lab

A professional AI Vulnerability Scanner and Daily Cybersecurity Progress Tracker with a cyberpunk-minimalist dark UI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/securai-lab run dev` — run the frontend (port 22323)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind CSS, Recharts, wouter

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/scans.ts` — scans table (vulnerability scan results)
- `lib/db/src/schema/metrics.ts` — pwn_metrics table (daily challenge logs)
- `artifacts/api-server/src/routes/` — scans, metrics, dashboard routes
- `artifacts/api-server/src/lib/scanner.ts` — rule-based vulnerability analysis engine
- `artifacts/securai-lab/src/` — React frontend (Dashboard, Scanner, Tracker pages)

## Architecture decisions

- Rule-based static analysis engine in `scanner.ts` — detects 16 vulnerability patterns across Python, JavaScript, C etc. No LLM key needed; add one by extending the analyzeCode function.
- Vulnerability results stored as JSON-serialized arrays in a text column to avoid array column complexity.
- Security rating computed dynamically from scan history (weighted by severity).
- Dashboard endpoints aggregate data server-side to minimize client queries.

## Product

- **Dashboard**: Real-time stats (total scans, challenges mastered, security rating), progress line chart, category bar chart, vulnerability severity breakdown, recent activity feed
- **Scanner**: Paste code, select language, run AI analysis — returns severity badge, vulnerability list, and remediation guide
- **Tracker**: Log daily CTF/hacking challenges with category, difficulty, notes — view full history with color-coded difficulty badges

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `vulnerabilitiesFound` is stored as a JSON string in the DB; parse/stringify when reading/writing
- Always restart the API server workflow after backend changes (`pnpm run build` is part of dev script)
- Seeded scan data uses `ON CONFLICT DO NOTHING` so re-seeding is safe

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
