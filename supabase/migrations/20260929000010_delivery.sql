-- Delivery fleet + public tracking: vendors manage riders/cars, dispatch
-- orders with a tracking code, customers follow live position updates.

create type public.fleet_type as enum ('motorbike', 'car', 'van', 'bicycle');

-- Wider status set for dispatch lifecycle (base enum lacks these).
alter type public.delivery_status add value if not exists 'dispatched';
alter type public.delivery_status add value if not exists 'out_for_delivery';
alter type public.delivery_status add value if not exists 'returned';

-- A vendor's riders / delivery vehicles. Trackers are mandatory — every
-- vehicle carries a GPS tracker whose device_id binds it to the tracking feed.
create table public.delivery_fleet (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  label text not null,                  -- e.g. 'Bike 1 — Tino'
  fleet_type public.fleet_type not null default 'motorbike',
  registration text,                    -- plate number
  driver_name text,
  driver_phone text,
  tracker_device_id text,               -- GPS tracker device/IMEI id
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index delivery_fleet_vendor_idx on public.delivery_fleet (vendor_id);

-- Extend the existing deliveries table with tracking fields.
alter table public.deliveries
  add column if not exists vendor_id uuid references public.vendors (id) on delete restrict,
  add column if not exists fleet_id uuid references public.delivery_fleet (id) on delete set null,
  add column if not exists tracking_code text unique,
  add column if not exists origin_text text,
  add column if not exists destination_text text,
  add column if not exists notes text,
  add column if not exists estimated_arrival timestamptz,
  add column if not exists movement_doc_url text;

create index if not exists deliveries_code_idx on public.deliveries (tracking_code);
create index if not exists deliveries_vendor_idx on public.deliveries (vendor_id, status);

-- Position/heartbeat events — 'tracker' rows come from the GPS provider,
-- 'manual' rows are typed in by dispatchers as fallback.
create table public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries (id) on delete cascade,
  status public.delivery_status,
  latitude numeric(9,6),
  longitude numeric(9,6),
  location_text text,                   -- manual fallback: "corner of X and Y"
  source text not null default 'manual' check (source in ('tracker', 'manual')),
  note text,
  created_at timestamptz not null default now()
);

create index delivery_events_idx on public.delivery_events (delivery_id, created_at desc);

alter table public.delivery_fleet enable row level security;
alter table public.delivery_events enable row level security;

-- Vendors manage their own fleet
create policy "vendors manage fleet"
  on public.delivery_fleet for all to authenticated
  using (public.has_vendor_permission(vendor_id, 'manage_orders'))
  with check (public.has_vendor_permission(vendor_id, 'manage_orders'));

-- Vendors can write their own deliveries too (base policy was admin-only).
create policy "vendors manage deliveries"
  on public.deliveries for all to authenticated
  using (public.has_vendor_permission(vendor_id, 'manage_orders'))
  with check (public.has_vendor_permission(vendor_id, 'manage_orders'));

-- Anyone can read a delivery + its events by tracking code (guest-friendly).
create policy "public track deliveries"
  on public.deliveries for select
  using (true);

create policy "public read delivery events"
  on public.delivery_events for select
  using (true);

create policy "vendors write delivery events"
  on public.delivery_events for insert to authenticated
  with check (
    exists (
      select 1 from public.deliveries d
      where d.id = delivery_id
        and public.has_vendor_permission(d.vendor_id, 'manage_orders')
    )
  );

grant select, insert, update, delete on public.delivery_fleet to authenticated;
grant select, insert, update on public.deliveries to authenticated;
grant select on public.deliveries to anon;
grant select, insert on public.delivery_events to authenticated;
grant select on public.delivery_events to anon;
