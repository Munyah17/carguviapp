import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  fulfilmentSteps,
  orderStatusLabel,
  orderStatusTone,
  vendorOrderStatusLabel,
} from "@/lib/order-status";
import { IconCheck, IconPin, IconStore, IconTruck } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: order } = await supabase
    .from("orders")
    .select(
      `*, addresses(*),
       payments(method, status, reference),
       vendor_orders(*, vendors(business_name, slug, phone, whatsapp),
                    vendor_locations(name, address, area, pickup_instructions),
                    order_items(*),
                    deliveries(provider, status, fee, tracking_note))`,
    )
    .eq("id", id)
    .single();
  if (!order || order.customer_id !== user.id) notFound();

  // Vendor orders already reviewed by this customer
  const { data: myReviews } = await supabase
    .from("reviews")
    .select("vendor_order_id")
    .eq("user_id", user.id)
    .in(
      "vendor_order_id",
      (order.vendor_orders as any[]).map((vo) => vo.id),
    );
  const reviewedVOs = new Set((myReviews ?? []).map((r: any) => r.vendor_order_id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      {sp.placed ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-trust-100 bg-trust-50 p-4 text-sm font-medium text-trust-700">
          <IconCheck className="h-5 w-5" />
          Order placed — the vendor has been notified.
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">
          Order {String(order.id).slice(0, 8)}
        </h1>
        <Badge tone={orderStatusTone(order.status)}>
          {orderStatusLabel(order.status)}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-ink-500">
        Placed {timeAgo(order.created_at)} · {formatPrice(order.total, order.currency)}
      </p>

      {(order.vendor_orders as any[]).map((vo) => {
        const steps = fulfilmentSteps(vo.fulfillment_type);
        const currentIdx = steps.indexOf(vo.status);
        return (
          <section
            key={vo.id}
            className="mt-5 rounded-xl border border-surface-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
              <Link
                href={`/vendors/${vo.vendors?.slug}`}
                className="font-semibold text-ink-900 hover:text-brand-700"
              >
                {vo.vendors?.business_name}
              </Link>
              <Badge tone={orderStatusTone(vo.status)}>
                {vendorOrderStatusLabel(vo.status)}
              </Badge>
            </div>

            {/* Progress */}
            <div className="px-4 pt-4">
              <ol className="relative space-y-4 border-l-2 border-surface-200 pl-5">
                {steps.map((step, i) => {
                  const done = currentIdx >= 0 && i <= currentIdx;
                  return (
                    <li key={step} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2",
                          done
                            ? "border-trust-600 bg-trust-600"
                            : "border-surface-300 bg-white",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          done
                            ? "font-medium text-ink-900"
                            : "text-ink-400",
                        )}
                      >
                        {vendorOrderStatusLabel(step)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Fulfilment info */}
            <div className="mt-4 border-t border-surface-100 px-4 py-3">
              {vo.fulfillment_type === "pickup" ? (
                <div className="flex gap-2 text-sm text-ink-700">
                  <IconStore className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  <div>
                    <p className="font-medium">Pickup</p>
                    {vo.vendor_locations ? (
                      <p className="text-ink-500">
                        {vo.vendor_locations.address}
                        {vo.vendor_locations.area
                          ? `, ${vo.vendor_locations.area}`
                          : ""}
                      </p>
                    ) : null}
                    {vo.vendor_locations?.pickup_instructions ? (
                      <p className="mt-1 text-xs text-ink-400">
                        {vo.vendor_locations.pickup_instructions}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 text-sm text-ink-700">
                  <IconTruck className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  <div>
                    <p className="font-medium">Carguvi Delivery</p>
                    {order.addresses ? (
                      <p className="text-ink-500">
                        {order.addresses.line1}, {order.addresses.area},{" "}
                        {order.addresses.city}
                      </p>
                    ) : null}
                    {vo.deliveries?.[0] ? (
                      <p className="mt-1 text-xs text-ink-400">
                        Status: {vo.deliveries[0].status.replace(/_/g, " ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <ul className="divide-y divide-surface-100 border-t border-surface-100 px-4">
              {vo.order_items.map((i: any) => (
                <li key={i.id} className="flex justify-between py-2.5 text-sm">
                  <span className="text-ink-700">
                    {i.quantity} × {i.title}
                  </span>
                  <span className="font-medium text-ink-900">
                    {formatPrice(Number(i.unit_price) * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {vo.status === "completed" && !reviewedVOs.has(vo.id) ? (
              <div className="border-t border-surface-100 px-4 py-3">
                <Link
                  href={`/reviews/new?vo=${vo.id}`}
                  className="tap inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
                >
                  Review {vo.vendors?.business_name}
                </Link>
              </div>
            ) : null}
          </section>
        );
      })}

      {/* Payment summary */}
      <section className="mt-5 rounded-xl border border-surface-200 bg-white p-4 text-sm">
        <div className="flex justify-between text-ink-500">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between text-ink-500">
          <span>Delivery</span>
          <span>{formatPrice(order.delivery_fee, order.currency)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-surface-100 pt-2 font-semibold text-ink-900">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </div>
        {order.payments?.[0] ? (
          <p className="mt-2 text-xs text-ink-400">
            {order.payments[0].method} · {order.payments[0].status} ·{" "}
            {order.payments[0].reference}
          </p>
        ) : null}
      </section>

      <div className="mt-5 flex gap-2">
        <Link
          href={`/disputes/new?order=${order.id}`}
          className="tap rounded-lg border border-surface-300 px-4 py-2 text-sm text-ink-700 hover:bg-surface-50"
        >
          Report a problem
        </Link>
      </div>
    </div>
  );
}
