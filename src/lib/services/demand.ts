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
      "id, title, availability, status, carguvi_verified_at, seller_confirmed_at, seller_updated_at, vendors(id, owner_user_id, business_name)",
    )
    .in("id", productIds)
    .eq("status", "active");

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

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

    // Escalate: if this stale listing keeps attracting demand, flag to ops
    // for a physical verification dispatch.
    const { count } = await admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("type", "demand_trigger")
      .filter("data->>product_id", "eq", (p as any).id)
      .gte("created_at", weekAgo);
    if ((count ?? 0) >= 2) {
      const { data: alreadyFlagged } = await admin
        .from("notifications")
        .select("id")
        .eq("type", "verification_recommended")
        .filter("data->>product_id", "eq", (p as any).id)
        .gte("created_at", weekAgo)
        .limit(1);
      if (!alreadyFlagged?.length) {
        const { data: admins } = await admin
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "super_admin"]);
        for (const a of admins ?? []) {
          await admin.from("notifications").insert({
            user_id: a.user_id,
            type: "verification_recommended",
            title: "Physical check recommended",
            body: `"${(p as any).title}" at ${(p as any).vendors?.business_name} is stale but attracting demand. Consider assigning an enumerator.`,
            data: {
              product_id: (p as any).id,
              vendor_id: (p as any).vendors?.id,
            },
          });
        }
      }
    }
  }
}
