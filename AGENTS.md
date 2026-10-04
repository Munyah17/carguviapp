# Carguvi — agent notes

Zimbabwean vehicle-parts marketplace. Next.js 16 (App Router + `proxy.ts`,
async request APIs), TypeScript strict, Tailwind 4, Supabase (Postgres +
Auth + Storage + RLS).

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (must pass before shipping)
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `supabase start` / `supabase stop` — local Supabase stack
- `npm run db:reset` — apply migrations + seed
- `npm run db:types` — regenerate `src/lib/database.types.ts` after schema
  changes (writes via PowerShell: use `Set-Content ... -Encoding utf8` if
  redirecting manually — `>` produces UTF-16 which breaks tsc)

## Conventions

- Next.js 16: `params`/`searchParams`/`cookies()`/`headers()` are async.
  Typed `PageProps<"/path">` / `LayoutProps<"/path">` globals come from
  `npx next typegen` (run after adding routes).
- All DB access via `@/lib/supabase/server` (RLS'd), `/admin` (bypasses RLS —
  server-only, use in actions after explicit role checks), `/client`.
- Mutations = server actions; validate roles with `getUserRoles` /
  `getVendorForUser` before touching data, then prefer user-scoped queries;
  use `createAdminClient` only when RLS must be bypassed (audited actions).
- Write `audit_logs` for admin/system actions; `inventory_events` for every
  product state change.
- External integrations behind abstractions in `src/lib/services/`:
  `payments` (mock, Paynow), `delivery`, `ai` (Groq + deterministic
  fallback), `demand` (vendor nudges). AI never mutates inventory truth.
- Enum-typed columns: cast `formData` values to the `Database` enum types —
  generated types are strict.
- Deploy direct to Vercel FIRST, verify live, then commit + push to GitHub
  `master`. Git integration is DISCONNECTED — pushes do not deploy.
  Deploy: `npx vercel deploy --prod --yes --token <token>` (project:
  carguviapp, id prj_BrM1304J8G2wRHLBUj3m3q31hwR6). Token is a secret —
  ask the user for it if not already provided this session; never commit it.

## Local ports

Supabase local: API 58321, DB 58322, Studio 58323, Mailpit 58324.
Dev server: http://localhost:3000.
