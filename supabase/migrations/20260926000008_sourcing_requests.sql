-- Custom part sourcing ("import on order" — SA / Dubai / China)

create type public.sourcing_status as enum (
  'requested', 'quoting', 'quoted', 'accepted',
  'ordered', 'in_transit', 'arrived', 'completed', 'cancelled'
);

create table public.sourcing_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  -- contact captured for anonymous requesters
  name text,
  contact text not null,                     -- phone / WhatsApp / email
  vehicle_description text,                  -- free text: "Mazda Demio 2011 1.3 petrol"
  part_name text not null,
  part_number text,
  condition_pref text not null default 'any' check (condition_pref in ('new', 'used', 'refurbished', 'any')),
  quantity int not null default 1 check (quantity > 0),
  notes text,
  source_pref text check (source_pref in ('south_africa', 'dubai', 'china', 'any')),
  -- quoting (admin filled)
  quote_amount numeric(12,2),
  currency text not null default 'USD',
  quote_timeline text,                       -- e.g. "10–14 days, from Dubai"
  admin_notes text,
  status public.sourcing_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sourcing_requests_status on public.sourcing_requests (status, created_at desc);
create index sourcing_requests_user on public.sourcing_requests (user_id);

alter table public.sourcing_requests enable row level security;

-- Anyone (incl. anonymous) can lodge a request.
create policy "anyone can request sourcing"
  on public.sourcing_requests for insert
  with check (true);

create policy "requester views own requests"
  on public.sourcing_requests for select
  using (user_id = auth.uid() or public.is_admin());

create policy "admins manage sourcing requests"
  on public.sourcing_requests for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete sourcing requests"
  on public.sourcing_requests for delete to authenticated
  using (public.is_admin());

grant insert, select on public.sourcing_requests to anon;
grant insert, select, update on public.sourcing_requests to authenticated;
