import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
import { IconPackage } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, status, total, currency, created_at,
       vendor_orders(id, status, fulfillment_type,
                     vendors(business_name, slug),
                     order_items(title, quantity))`,
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Orders</h1>
      {!orders?.length ? (
        <div className="mt-8 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center">
          <IconPackage className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 font-medium text-ink-700">No orders yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Your orders will appear here after checkout.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o: any) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="tap block rounded-xl border border-surface-200 bg-white p-4 hover:border-brand-200"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink-900">
                    {formatPrice(o.total, o.currency)}
                  </p>
                  <Badge tone={orderStatusTone(o.status)}>
                    {orderStatusLabel(o.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {o.vendor_orders
                    .map((vo: any) => vo.vendors?.business_name)
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  {timeAgo(o.created_at)} ·{" "}
                  {o.vendor_orders.reduce(
                    (s: number, vo: any) => s + vo.order_items.length,
                    0,
                  )}{" "}
                  item(s)
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
