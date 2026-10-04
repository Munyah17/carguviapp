import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, status, total, currency, created_at, profiles:customer_id(full_name), vendor_orders(vendors(business_name))",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Orders</h1>
      <ul className="mt-4 divide-y divide-surface-100 rounded-xl border border-surface-200 bg-white">
        {(orders ?? []).map((o: any) => (
          <li key={o.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-900">
                {o.profiles?.full_name ?? "Customer"} ·{" "}
                {formatPrice(o.total, o.currency)}
              </p>
              <p className="text-xs text-ink-500">
                {o.vendor_orders
                  .map((vo: any) => vo.vendors?.business_name)
                  .join(", ")}{" "}
                · {timeAgo(o.created_at)}
              </p>
            </div>
            <Badge tone={orderStatusTone(o.status)}>
              {orderStatusLabel(o.status)}
            </Badge>
          </li>
        ))}
        {!orders?.length ? (
          <li className="px-4 py-8 text-center text-sm text-ink-500">
            No orders.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
