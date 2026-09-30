import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { formatPrice, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { orderStatusTone, vendorOrderStatusLabel } from "@/lib/order-status";
import { advanceVendorOrder, rejectVendorOrder } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendor orders" };

const NEXT_LABEL: Record<string, string> = {
  paid: "Accept order",
  accepted: "Start preparing",
  preparing: "", // resolved by fulfilment type
  ready_for_pickup: "Mark collected",
  out_for_delivery: "Mark delivered",
  collected: "Complete",
  delivered: "Complete",
};

export default async function VendorOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");

  const { data: orders } = await supabase
    .from("vendor_orders")
    .select(
      `id, status, fulfillment_type, subtotal, delivery_fee, created_at, vendor_note,
       order_items(title, quantity, unit_price),
       orders(customer_id, profiles:customer_id(full_name, phone))`,
    )
    .eq("vendor_id", info.vendor.id)
    .order("created_at", { ascending: false });

  const open = (orders ?? []).filter(
    (o: any) => !["completed", "rejected", "cancelled", "refunded"].includes(o.status),
  );
  const done = (orders ?? []).filter((o: any) => !open.includes(o));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Orders</h1>

      {orders?.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-500">
          No orders yet. They&apos;ll appear here when customers buy from you.
        </p>
      ) : null}

      <Section title="Need action" orders={open} />
      <Section title="Closed" orders={done} />
    </div>
  );
}

function Section({ title, orders }: { title: string; orders: any[] }) {
  if (!orders.length) return null;
  return (
    <>
      <h2 className="mb-2 mt-6 text-sm font-semibold text-ink-500">{title}</h2>
      <ul className="space-y-3">
        {orders.map((o: any) => {
          const nextLabel =
            o.status === "preparing"
              ? o.fulfillment_type === "pickup"
                ? "Ready for pickup"
                : "Dispatch delivery"
              : NEXT_LABEL[o.status];
          return (
            <li
              key={o.id}
              className="rounded-xl border border-surface-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-900">
                  {formatPrice(o.subtotal + (o.delivery_fee ?? 0))}
                </p>
                <Badge tone={orderStatusTone(o.status)}>
                  {vendorOrderStatusLabel(o.status)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {timeAgo(o.created_at)} Â·{" "}
                {o.fulfillment_type === "pickup" ? "Pickup" : "Carguvi Delivery"} Â·{" "}
                {o.orders?.profiles?.full_name ?? "Customer"}
              </p>
              <ul className="mt-2 text-sm text-ink-700">
                {o.order_items.map((i: any, idx: number) => (
                  <li key={idx}>
                    {i.quantity} Ã— {i.title}
                  </li>
                ))}
              </ul>
              {!["completed", "rejected", "cancelled", "refunded", "pending_payment"].includes(
                o.status,
              ) ? (
                <div className="mt-3 flex gap-2">
                  {nextLabel ? (
                    <form
                      action={async () => {
                        "use server";
                        await advanceVendorOrder(o.id);
                      }}
                    >
                      <button className="tap rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white">
                        {nextLabel}
                      </button>
                    </form>
                  ) : null}
                  <form
                    action={async () => {
                      "use server";
                      await rejectVendorOrder(o.id);
                    }}
                  >
                    <button className="tap rounded-lg border border-surface-300 px-4 py-2 text-sm text-red-600">
                      Can&apos;t fulfil
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
