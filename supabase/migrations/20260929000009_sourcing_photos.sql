-- Custom-order photos (vehicle + part pictures) and Japan sourcing option.

alter table public.sourcing_requests
  add column if not exists vehicle_photo_url text,
  add column if not exists part_photo_url text;

-- Allow 'japan' as a source preference.
alter table public.sourcing_requests
  drop constraint if exists sourcing_requests_source_pref_check;
alter table public.sourcing_requests
  add constraint sourcing_requests_source_pref_check
  check (source_pref in ('south_africa', 'dubai', 'china', 'japan', 'any'));

-- Public bucket for requester-uploaded photos (guests upload too).
insert into storage.buckets (id, name, public)
values ('sourcing-photos', 'sourcing-photos', true)
on conflict (id) do nothing;

-- Anyone (incl. anonymous guests) can upload a photo into sourcing-photos.
create policy "anyone uploads sourcing photos"
  on storage.objects for insert
  with check (bucket_id = 'sourcing-photos');
