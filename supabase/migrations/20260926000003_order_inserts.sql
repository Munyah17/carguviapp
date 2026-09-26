-- Allow customers to create vendor_orders and order_items for their own orders.

create policy vendor_orders_customer_insert on public.vendor_orders
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );

create policy order_items_customer_insert on public.order_items
  for insert with check (
    exists (
      select 1 from public.vendor_orders vo
      join public.orders o on o.id = vo.order_id
      where vo.id = vendor_order_id and o.customer_id = auth.uid()
    )
  );

-- Customers may create deliveries rows implicitly via checkout? No —
-- deliveries are written by the service layer only. Policy stays admin-only.
