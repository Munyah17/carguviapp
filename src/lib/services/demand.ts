import { createAdminClient } from "@/lib/supabase/admin";
import { daysSince } from "@/lib/format";

/**
 * Demand-triggered verification.
 *
 * When customer demand (search/views/inquiries) touches a stale listing, we
 * nudge the vendor to confirm — "A customer is looking for this item."
 * Deduped: at most one demand notification per product per 24h.
 */
export async function signalDemand(productIds: string[]) {
  if (!productIds.length) return;
  const admin = createAdminClient();

  const { data: products } = await admin
    .from("products")
    .select(
      "id, title, availability, status, carguvi_verified_at, seller_confirmed_at, seller_updated_at, vendors(id, owner_user_id)",
    )
    .in("id", productIds)
    .eq("status", "active");

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  for (const p of products ?? []) {
    if ((p as any).availability === "out_of_stock") continue;
    const days = daysSince(
      (p as any).carguvi_verified_at ??
        (p as any).seller_confirmed_at ??
        (p as any).seller_updated_at,
    );
    if (days === null || days <= 14) continue; // only stale listings

    const ownerId = (p as any).vendors?.owner_user_id;
    if (!ownerId) continue;

    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", ownerId)
      .eq("type", "demand_trigger")
      .gte("created_at", since)
      .filter("data->>product_id", "eq", (p as any).id)
      .limit(1);
    if (recent?.length) continue;

    await admin.from("notifications").insert({
      user_id: ownerId,
      type: "demand_trigger",
      title: "A customer is looking for this item",
      body: `Your ${(p as any).title} listing hasn't been confirmed recently. Still available?`,
      data: { product_id: (p as any).id },
    });
  }
}
