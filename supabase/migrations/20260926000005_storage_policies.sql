-- Storage object policies.
-- product-images (public bucket): vendors write only inside a folder named
-- after their own vendor id:  <vendor_id>/<file>.
-- verification-photos (private): enumerators write under their own folder;
-- reads restricted to enumerators/admins.

create policy "Vendors upload to own product-images folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and public.has_vendor_permission(nullif((storage.foldername(name))[1], '')::uuid, 'manage_products')
  );

create policy "Vendors update own product-images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and public.has_vendor_permission(nullif((storage.foldername(name))[1], '')::uuid, 'manage_products')
  );

create policy "Vendors delete own product-images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and public.has_vendor_permission(nullif((storage.foldername(name))[1], '')::uuid, 'manage_products')
  );

create policy "Enumerators upload verification photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verification-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from user_roles r
      where r.user_id = auth.uid()
        and r.role in ('enumerator', 'admin', 'super_admin')
    )
  );

create policy "Verification photos readable by staff"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from user_roles r
        where r.user_id = auth.uid()
          and r.role in ('admin', 'super_admin')
      )
    )
  );

