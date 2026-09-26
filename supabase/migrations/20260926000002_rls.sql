-- Carguvi Row Level Security
-- Enforces data isolation at the database layer, not just in the UI.

-- ---------------------------------------------------------------------------
-- Helper functions (security definer to avoid recursive policy evaluation)
-- ---------------------------------------------------------------------------

create or replace function public.has_role(r app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = r
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('admin') or public.has_role('super_admin');
$$;

create or replace function public.is_vendor_member(p_vendor_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vendors v
    where v.id = p_vendor_id and v.owner_user_id = auth.uid()
  ) or exists (
    select 1 from public.vendor_staff s
    where s.vendor_id = p_vendor_id and s.user_id = auth.uid() and s.is_active
  );
$$;

create or replace function public.is_vendor_owner(p_vendor_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vendors v
    where v.id = p_vendor_id and v.owner_user_id = auth.uid()
  );
$$;

-- Vendor staff permission check. Vendors' owners implicitly have all
-- permissions; staff need the permission key set to true in their permissions
-- jsonb (e.g. {"manage_products": true, "manage_orders": true}).
create or replace function public.has_vendor_permission(p_vendor_id uuid, p_permission text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_vendor_owner(p_vendor_id) or exists (
    select 1 from public.vendor_staff s
    where s.vendor_id = p_vendor_id
      and s.user_id = auth.uid()
      and s.is_active
      and coalesce((s.permissions ->> p_permission)::boolean, false)
  );
$$;

create or replace function public.is_enumerator_for_task(p_task_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.verification_tasks t
    where t.id = p_task_id and t.enumerator_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.vehicle_makes enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.vehicle_generations enable row level security;
alter table public.vehicle_engines enable row level security;
alter table public.customer_vehicles enable row level security;
alter table public.categories enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_locations enable row level security;
alter table public.vendor_staff enable row level security;
alter table public.vendor_metrics enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_compatibility enable row level security;
alter table public.inventory_events enable row level security;
alter table public.seller_confirmations enable row level security;
alter table public.verification_tasks enable row level security;
alter table public.carguvi_verifications enable row level security;
alter table public.verification_photos enable row level security;
alter table public.search_events enable row level security;
alter table public.product_views enable row level security;
alter table public.product_favourites enable row level security;
alter table public.inquiries enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.vendor_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.deliveries enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.ai_events enable row level security;
alter table public.platform_settings enable row level security;

-- ---------------------------------------------------------------------------
-- profiles / user_roles
-- ---------------------------------------------------------------------------

create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid() or public.is_admin());

create policy user_roles_select on public.user_roles
  for select using (user_id = auth.uid() or public.has_role('super_admin'));
-- Roles are granted by super admins only (or the bootstrap trigger).
create policy user_roles_admin_write on public.user_roles
  for all using (public.has_role('super_admin'));

-- ---------------------------------------------------------------------------
-- Vehicle catalogue: public read, admin write
-- ---------------------------------------------------------------------------

create policy vehicle_makes_read on public.vehicle_makes for select using (true);
create policy vehicle_models_read on public.vehicle_models for select using (true);
create policy vehicle_generations_read on public.vehicle_generations for select using (true);
create policy vehicle_engines_read on public.vehicle_engines for select using (true);

create policy vehicle_makes_admin on public.vehicle_makes for all using (public.is_admin());
create policy vehicle_models_admin on public.vehicle_models for all using (public.is_admin());
create policy vehicle_generations_admin on public.vehicle_generations for all using (public.is_admin());
create policy vehicle_engines_admin on public.vehicle_engines for all using (public.is_admin());

create policy customer_vehicles_owner on public.customer_vehicles
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy categories_read on public.categories for select using (true);
create policy categories_admin on public.categories for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Vendors
-- ---------------------------------------------------------------------------

-- Approved vendors are public. Pending/suspended visible to owner, staff, admin.
create policy vendors_read on public.vendors for select using (
  status = 'approved'
  or public.is_admin()
  or owner_user_id = auth.uid()
  or public.is_vendor_member(id)
  -- enumerators need to see vendors they have tasks for
  or exists (
    select 1 from public.verification_tasks t
    where t.vendor_id = vendors.id and t.enumerator_id = auth.uid()
  )
);
create policy vendors_insert on public.vendors
  for insert with check (owner_user_id = auth.uid() or public.is_admin());
create policy vendors_update on public.vendors
  for update using (public.is_vendor_owner(id) or public.is_admin());
-- Only admins can change status/verification fields — enforced via trigger
-- below rather than column privileges (Supabase-friendly).

create or replace function public.guard_vendor_admin_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.is_verified := old.is_verified;
    new.verified_at := old.verified_at;
    new.owner_user_id := old.owner_user_id;
  end if;
  return new;
end $$;

create trigger guard_vendor_admin_fields_trigger
  before update on public.vendors
  for each row execute function public.guard_vendor_admin_fields();

create policy vendor_locations_read on public.vendor_locations for select using (true);
create policy vendor_locations_write on public.vendor_locations
  for all using (public.is_vendor_member(vendor_id) or public.is_admin())
  with check (public.is_vendor_member(vendor_id) or public.is_admin());

create policy vendor_staff_read on public.vendor_staff
  for select using (public.is_vendor_member(vendor_id) or public.is_admin());
create policy vendor_staff_write on public.vendor_staff
  for all using (public.is_vendor_owner(vendor_id) or public.is_admin())
  with check (public.is_vendor_owner(vendor_id) or public.is_admin());

create policy vendor_metrics_read on public.vendor_metrics
  for select using (public.is_vendor_member(vendor_id) or public.is_admin());

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

-- Vendors and staff may not stamp Carguvi verification themselves; that is
-- reserved for the verification flow (admins/enumerators) which records it
-- via carguvi_verifications + a service-side update.
create or replace function public.guard_product_verification_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or public.has_role('enumerator')) then
    new.carguvi_verified_at := old.carguvi_verified_at;
  end if;
  return new;
end $$;

create trigger guard_product_verification_trigger
  before update on public.products
  for each row execute function public.guard_product_verification_fields();

create policy products_read on public.products for select using (
  (status = 'active' and exists (
    select 1 from public.vendors v where v.id = products.vendor_id and v.status = 'approved'
  ))
  or public.is_admin()
  or public.is_vendor_member(vendor_id)
  or exists (
    select 1 from public.verification_tasks t
    where t.product_id = products.id and t.enumerator_id = auth.uid()
  )
);
create policy products_insert on public.products
  for insert with check (public.has_vendor_permission(vendor_id, 'manage_products') or public.is_admin());
create policy products_update on public.products
  for update using (public.has_vendor_permission(vendor_id, 'manage_products') or public.is_admin());
create policy products_delete on public.products
  for delete using (public.is_vendor_owner(vendor_id) or public.is_admin());

create policy product_images_read on public.product_images for select using (true);
create policy product_images_write on public.product_images
  for all using (
    public.has_vendor_permission((select p.vendor_id from public.products p where p.id = product_id), 'manage_products')
    or public.is_admin()
  );

create policy product_compat_read on public.product_compatibility for select using (true);
create policy product_compat_write on public.product_compatibility
  for all using (
    public.has_vendor_permission((select p.vendor_id from public.products p where p.id = product_id), 'manage_products')
    or public.is_admin()
  );

-- helper to resolve vendor for event rows
create or replace function public.vendor_id_from_product(p_product_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select vendor_id from public.products where id = p_product_id;
$$;

create policy inventory_events_read on public.inventory_events for select using (
  public.is_admin()
  or public.is_vendor_member(public.vendor_id_from_product(product_id))
);

create policy seller_confirmations_read on public.seller_confirmations for select using (
  public.is_vendor_member(vendor_id) or public.is_admin()
);
create policy seller_confirmations_insert on public.seller_confirmations
  for insert with check (public.is_vendor_member(vendor_id) or public.is_admin());

-- ---------------------------------------------------------------------------
-- Verification
-- ---------------------------------------------------------------------------

create policy verification_tasks_read on public.verification_tasks for select using (
  enumerator_id = auth.uid() or public.is_admin()
  or public.is_vendor_member(vendor_id)
);
create policy verification_tasks_admin_write on public.verification_tasks
  for all using (public.is_admin());
create policy verification_tasks_enum_update on public.verification_tasks
  for update using (enumerator_id = auth.uid());

create policy carguvi_verifications_read on public.carguvi_verifications for select using (
  enumerator_id = auth.uid() or public.is_admin()
  or public.is_vendor_member(vendor_id)
);
create policy carguvi_verifications_insert on public.carguvi_verifications
  for insert with check (enumerator_id = auth.uid() or public.is_admin());
create policy carguvi_verifications_update on public.carguvi_verifications
  for update using (enumerator_id = auth.uid() or public.is_admin());

create policy verification_photos_read on public.verification_photos for select using (
  public.is_admin() or exists (
    select 1 from public.carguvi_verifications cv
    where cv.id = verification_id
      and (cv.enumerator_id = auth.uid() or public.is_vendor_member(cv.vendor_id))
  )
);
create policy verification_photos_insert on public.verification_photos
  for insert with check (
    public.is_admin() or exists (
      select 1 from public.carguvi_verifications cv
      where cv.id = verification_id and cv.enumerator_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Demand signals
-- ---------------------------------------------------------------------------

create policy search_events_insert on public.search_events
  for insert with check (user_id is null or user_id = auth.uid());
create policy search_events_admin_read on public.search_events
  for select using (public.is_admin());

create policy product_views_insert on public.product_views
  for insert with check (user_id is null or user_id = auth.uid());
create policy product_views_admin_read on public.product_views
  for select using (public.is_admin());

create policy favourites_owner on public.product_favourites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy inquiries_insert on public.inquiries
  for insert with check (user_id is null or user_id = auth.uid());
create policy inquiries_read on public.inquiries for select using (
  user_id = auth.uid() or public.is_admin() or public.is_vendor_member(vendor_id)
);
create policy inquiries_vendor_update on public.inquiries
  for update using (public.is_vendor_member(vendor_id) or public.is_admin());

-- ---------------------------------------------------------------------------
-- Commerce
-- ---------------------------------------------------------------------------

create policy carts_owner on public.carts
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy cart_items_owner on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
    or public.is_admin()
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
    or public.is_admin()
  );

create policy addresses_owner on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy orders_customer on public.orders for select using (
  customer_id = auth.uid() or public.is_admin()
  or exists (
    select 1 from public.vendor_orders vo
    where vo.order_id = orders.id and public.is_vendor_member(vo.vendor_id)
  )
);
create policy orders_insert on public.orders
  for insert with check (customer_id = auth.uid());
create policy orders_update on public.orders
  for update using (customer_id = auth.uid() or public.is_admin());

create policy vendor_orders_read on public.vendor_orders for select using (
  public.is_vendor_member(vendor_id) or public.is_admin()
  or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
);
create policy vendor_orders_vendor_update on public.vendor_orders
  for update using (public.has_vendor_permission(vendor_id, 'manage_orders') or public.is_admin());

create policy order_items_read on public.order_items for select using (
  public.is_admin()
  or exists (
    select 1 from public.vendor_orders vo
    join public.orders o on o.id = vo.order_id
    where vo.id = vendor_order_id
      and (o.customer_id = auth.uid() or public.is_vendor_member(vo.vendor_id))
  )
);

create policy payments_read on public.payments for select using (
  public.is_admin()
  or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
);
create policy payments_insert on public.payments
  for insert with check (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );
create policy payments_update on public.payments
  for update using (public.is_admin());

create policy payment_transactions_read on public.payment_transactions for select using (
  public.is_admin()
  or exists (
    select 1 from public.payments p
    join public.orders o on o.id = p.order_id
    where p.id = payment_id and o.customer_id = auth.uid()
  )
);
create policy payment_transactions_insert on public.payment_transactions
  for insert with check (public.is_admin());

create policy deliveries_read on public.deliveries for select using (
  public.is_admin()
  or exists (
    select 1 from public.vendor_orders vo
    join public.orders o on o.id = vo.order_id
    where vo.id = vendor_order_id
      and (o.customer_id = auth.uid() or public.is_vendor_member(vo.vendor_id))
  )
);
create policy deliveries_write on public.deliveries
  for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Reviews, disputes, notifications, audit, AI, settings
-- ---------------------------------------------------------------------------

create policy reviews_read on public.reviews for select using (true);
create policy reviews_insert on public.reviews
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.vendor_orders vo
      where vo.id = vendor_order_id and vo.status = 'completed'
        and exists (select 1 from public.orders o where o.id = vo.order_id and o.customer_id = auth.uid())
    )
  );

create policy disputes_read on public.disputes for select using (
  user_id = auth.uid() or public.is_admin()
  or (vendor_id is not null and public.is_vendor_member(vendor_id))
);
create policy disputes_insert on public.disputes
  for insert with check (user_id = auth.uid());
create policy disputes_update on public.disputes
  for update using (public.is_admin());

create policy notifications_owner on public.notifications for select using (user_id = auth.uid());
create policy notifications_update on public.notifications
  for update using (user_id = auth.uid());
create policy notifications_insert on public.notifications
  for insert with check (public.is_admin() or user_id = auth.uid());

create policy audit_logs_admin on public.audit_logs
  for select using (public.is_admin());

create policy ai_events_admin on public.ai_events
  for select using (public.is_admin());

create policy platform_settings_read on public.platform_settings
  for select using (public.is_admin());
create policy platform_settings_super on public.platform_settings
  for all using (public.has_role('super_admin'));
