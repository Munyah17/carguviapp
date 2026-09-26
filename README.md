# Carguvi

**Find the part. Trust the source.**

A multi-vendor vehicle-parts marketplace for Zimbabwe, starting with the
Kaguvi Street supply cluster in Harare. Customers search for parts, see
vendor listings with **Carguvi-confirmed** freshness, and order for pickup
or Carguvi Delivery.

## Stack

- **Next.js 16** (App Router, proxy) + TypeScript (strict)
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL + Auth + Storage) with full Row Level Security
- Service abstractions: `src/lib/services/{payments,delivery,ai}` — mock
  providers in dev, replaceable in production (Paynow/EcoCash, couriers, Groq)

## Local development

```bash
npm install
supabase start        # boots Postgres, Auth, Storage, Studio
npm run db:reset      # applies migrations + seed data
npm run dev
```

Copy `.env.example` → `.env.local` and fill in the keys printed by
`supabase start` (anon/publishable key and service/secret key).

## Demo accounts (seed data, password: `password123`)

| Role        | Email                        |
| ----------- | ---------------------------- |
| Customer    | customer@carguvi.co.zw       |
| Vendor      | mambo@carguvi.co.zw          |
| Staff       | cashier@carguvi.co.zw        |
| Enumerator  | enumerator@carguvi.co.zw     |
| Admin       | admin@carguvi.co.zw          |
| Super admin | superadmin@carguvi.co.zw     |

Canonical demo: sign in as customer → search "Mazda Demio new shape petrol
engine" → three vendors with different prices and confirmation ages →
add to cart → checkout (pickup or Carguvi Delivery) → vendor receives the
order at `/vendor/orders`.

## Database

Migrations in `supabase/migrations/`, demo data in `supabase/seed.sql`.
Regenerate typed models with `npm run db:types`.

## Deploying to Vercel

1. Push to GitHub (done — `origin` = github.com/Munyah17/carguviapp).
2. In Vercel: **Add New → Project → Import `carguviapp`**.
3. Add environment variables (`.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY` (optional — app falls back to deterministic AI)
   - `CRON_SECRET` (protects `/api/reminders`)
4. Point the app at a hosted Supabase project: apply migrations with
   `supabase db push` or `supabase link` + `migration up`, then optionally
   run `supabase/seed.sql` for demo data.
5. Deploy. The build (`npm run build`) passes cleanly.
