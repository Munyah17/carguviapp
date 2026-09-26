import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { daysSince } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconBell,
  IconCheck,
  IconPackage,
  IconPin,
  IconPlus,
  IconShield,
  IconStore,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendor dashboard" };

export default async function VendorDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/vendor");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");
  const vendor = info.vendor;

  if (vendor.status === "pending") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <IconClockBig />
        <h1 className="mt-4 text-xl font-bold text-ink-900">
          Application under review
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Thanks, {vendor.business_name}. A Carguvi admin will verify your
          business and approve your storefront. You&apos;ll be notified.
        </p>
      </div>
    );
  }

  const [
    { data: products },
    { data: openOrders },
    { data: inquiries },
    { data: metrics },
    { count: salesCount },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, availability, seller_confirmed_at, seller_updated_at, carguvi_verified_at, status")
      .eq("vendor_id", vendor.id)
      .eq("status", "active"),
    supabase
      .from("vendor_orders")
      .select("id, status, fulfillment_type, created_at, order_items(title, quantity)")
      .eq("vendor_id", vendor.id)
      .in("status", ["paid", "accepted", "preparing", "ready_for_pickup", "out_for_delivery"]),
    supabase
      .from("inquiries")
      .select("id")
      .eq("vendor_id", vendor.id)
      .eq("status", "open"),
    supabase
      .from("vendor_metrics")
      .select("*")
      .eq("vendor_id", vendor.id)
      .maybeSingle(),
    supabase
      .from("vendor_orders")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", vendor.id)
      .eq("status", "completed"),
  ]);

  const stale = (products ?? []).filter((p: any) => {
    if (["out_of_stock", "unknown"].includes(p.availability)) return false;
    const days = daysSince(
      p.carguvi_verified_at ?? p.seller_confirmed_at ?? p.seller_updated_at,
    );
    return days === null || days > 14;
  });

  const outOfStock = (products ?? []).filter(
    (p: any) => p.availability === "out_of_stock",
  );

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            {greeting}, {vendor.business_name}
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-500">
            {vendor.operating_area ?? vendor.city}
            {vendor.is_verified ? (
              <Badge tone="blue">
                <IconShield className="h-3 w-3" /> Carguvi Verified
              </Badge>
            ) : null}
          </p>
        </div>
        <ButtonLink href="/vendor/products/new" size="sm">
          <IconPlus className="h-4 w-4" /> Add product
        </ButtonLink>
      </div>

      {/* Action cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          href="/vendor/orders"
          count={openOrders?.length ?? 0}
          label="Orders awaiting action"
          tone={openOrders?.length ? "blue" : "gray"}
        />
        <StatCard
          href="/vendor/confirmations"
          count={stale.length}
          label="Listings needing confirmation"
          tone={stale.length ? "amber" : "gray"}
        />
        <StatCard
          href="/vendor/inquiries"
          count={inquiries?.length ?? 0}
          label="Customer inquiries"
          tone={inquiries?.length ? "blue" : "gray"}
        />
        <StatCard
          href="/vendor/products"
          count={salesCount ?? 0}
          label="Orders completed"
        />
      </div>

      {stale.length > 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <IconBell className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="flex-1 text-sm text-ink-700">
            <strong>{stale.length} listing{stale.length === 1 ? "" : "s"}</strong>{" "}
            haven&apos;t been confirmed recently. Keep them fresh so customers
            trust your stock.
          </p>
          <ButtonLink href="/vendor/confirmations" variant="outline" size="sm">
            Confirm now
          </ButtonLink>
        </div>
      ) : null}

      {/* Reliability */}
      <div className="mt-6 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink-900">Your reliability</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Stock accuracy" value={metrics?.stock_accuracy} suffix="%" />
          <Metric label="Fulfilment" value={metrics?.fulfilment_rate} suffix="%" />
          <Metric
            label="Rating"
            value={vendor.rating ? Number(vendor.rating) : null}
            suffix=""
            sub={vendor.review_count ? `${vendor.review_count} reviews` : undefined}
          />
          <Metric label="Confirmation" value={metrics?.confirmation_consistency} suffix="%" />
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Reliable vendors appear higher in search. Keep listings fresh and
          fulfil orders promptly.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction href="/vendor/products/new" icon={<IconPlus className="h-5 w-5" />} label="Add product" />
        <QuickAction href="/vendor/products" icon={<IconPackage className="h-5 w-5" />} label="Update stock" />
        <QuickAction href="/vendor/confirmations" icon={<IconCheck className="h-5 w-5" />} label="Confirm listings" />
        <QuickAction href={`/vendors/${vendor.slug}`} icon={<IconStore className="h-5 w-5" />} label="View storefront" />
      </div>

      {/* Recent orders */}
      {openOrders?.length ? (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-ink-900">
            Orders needing action
          </h2>
          <ul className="divide-y divide-surface-100 rounded-xl border border-surface-200 bg-white">
            {openOrders.slice(0, 5).map((o: any) => (
              <li key={o.id}>
                <Link
                  href="/vendor/orders"
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-ink-700">
                    {o.order_items?.length ?? 0} item(s) ·{" "}
                    {o.fulfillment_type === "pickup" ? "Pickup" : "Delivery"}
                  </span>
                  <Badge tone="blue">{o.status.replace(/_/g, " ")}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function IconClockBig() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="mx-auto h-12 w-12 text-amber-500"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({
  href,
  count,
  label,
  tone = "gray",
}: {
  href: string;
  count: number;
  label: string;
  tone?: "blue" | "amber" | "gray";
}) {
  const colors = {
    blue: "border-brand-200 bg-brand-50",
    amber: "border-amber-200 bg-amber-50",
    gray: "border-surface-200 bg-white",
  } as const;
  return (
    <Link
      href={href}
      className={`tap rounded-xl border p-4 ${colors[tone]}`}
    >
      <p className="text-2xl font-bold text-ink-900">{count}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-500">{label}</p>
    </Link>
  );
}

function Metric({
  label,
  value,
  suffix,
  sub,
}: {
  label: string;
  value: number | null | undefined;
  suffix: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-lg font-bold text-ink-900">
        {value != null ? `${Math.round(value)}${suffix}` : "—"}
      </p>
      <p className="text-xs text-ink-500">{label}</p>
      {sub ? <p className="text-xs text-ink-400">{sub}</p> : null}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="tap flex items-center gap-2.5 rounded-xl border border-surface-200 bg-white p-4 text-sm font-medium text-ink-900 hover:border-brand-200 hover:bg-brand-50"
    >
      <span className="text-brand-700">{icon}</span>
      {label}
    </Link>
  );
}
