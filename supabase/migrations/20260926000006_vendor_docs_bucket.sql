-- vendor-documents bucket policies (bucket itself is declared in
-- supabase/config.toml for local dev; create it in the dashboard for cloud).

create policy "Applicants upload own vendor documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vendor-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Vendor documents readable by owner and admins"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'vendor-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from user_roles r
        where r.user_id = auth.uid()
          and r.role in ('admin', 'super_admin')
      )
    )
  );
