-- Marketing hero slides, editable from the admin portal.

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  overlay_opacity int not null default 70 check (overlay_opacity between 0 and 95),
  cta_primary_label text,
  cta_primary_href text,
  cta_secondary_label text,
  cta_secondary_href text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

create policy "hero slides readable by everyone"
  on public.hero_slides for select
  using (is_active or public.is_admin());

create policy "admins manage hero slides"
  on public.hero_slides for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
