import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { daysSince } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminOverview() {
  const supabase = await createClient();

  const [
    { count: pendingVendors },
    { count: totalVendors },
    { count: openDisputes },
    { count: totalOrders },
    { count: totalCustomers },
    { data: staleProducts },
    { data: openTasks },
    { data: flaggedVerifications },
    { data: zeroResultSearches },
  ] = await Promise.all([
    supabase.from("vendors").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase.from("disputes").select("id", { count: "exact", head: true }).in("status", ["open", "under_review"]),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("products")
      .select("id, seller_confirmed_at, seller_updated_at, carguvi_verified_at, availability, status")
      .eq("status", "active"),
    supabase
      .from("verification_tasks")
      .select("id, status")
      .in("status", ["assigned", "started"]),
    supabase
      .from("carguvi_verifications")
      .select("id")
      .or("price_discrepancy.eq.true,availability_discrepancy.eq.true"),
    supabase
      .from("search_events")
      .select("query")
      .eq("results_count", 0)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const stale = (staleProducts ?? []).filter((p: any) => {
    if (p.availability === "out_of_stock") return false;
    const days = daysSince(
      p.carguvi_verified_at ?? p.seller_confirmed_at ?? p.seller_updated_at,
    );
    return days === null || days > 14;
  });

  const cards = [
    { label: "Vendors pending approval", value: pendingVendors ?? 0, href: "/admin/vendors?status=pending", alert: (pendingVendors ?? 0) > 0 },
    { label: "Active vendors", value: totalVendors ?? 0, href: "/admin/vendors" },
    { label: "Stale listings", value: stale.length, href: "/admin/products?stale=1", alert: stale.length > 0 },
    { label: "Open verification tasks", value: openTasks?.length ?? 0, href: "/admin/verification" },
    { label: "Flagged discrepancies", value: flaggedVerifications?.length ?? 0, href: "/admin/verification", alert: (flaggedVerifications?.length ?? 0) > 0 },
    { label: "Open disputes", value: openDisputes ?? 0, href: "/admin/disputes", alert: (openDisputes ?? 0) > 0 },
    { label: "Total orders", value: totalOrders ?? 0, href: "/admin/orders" },
    { label: "Customers", value: totalCustomers ?? 0, href: "/admin/customers" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Operations overview</h1>
      <p className="mt-1 text-sm text-ink-500">
        Exceptions first — what needs attention today.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`tap rounded-xl border p-4 ${
              c.alert
                ? "border-amber-300 bg-amber-50"
                : "border-surface-200 bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-ink-900">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-ink-500">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Unmet demand: searches that returned nothing */}
      {(() => {
        const freq = new Map<string, number>();
        for (const s of zeroResultSearches ?? []) {
          const q = (s.query ?? "").trim().toLowerCase();
          if (!q) continue;
          freq.set(q, (freq.get(q) ?? 0) + 1);
        }
        const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        return top.length ? (
          <section className="mt-6 rounded-xl border border-surface-200 bg-white p-4">
            <h2 className="font-semibold text-ink-900">
              Unmet demand
              <span className="ml-2 text-xs font-normal text-ink-400">
                searches with no results — sourcing opportunities
              </span>
            </h2>
            <ul className="mt-2 divide-y divide-surface-100">
              {top.map(([q, n]) => (
                <li
                  key={q}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-ink-700">{q}</span>
                  <Badge tone="amber">{n}×</Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null;
      })()}
    </div>
  );
}
