import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAIProvider } from "@/lib/services/ai";
import { daysSince } from "@/lib/format";

/**
 * GET /api/reminders — scheduled job (Vercel Cron / supabase scheduler).
 *
 * Finds vendors with stale listings and sends ONE batched, prioritised
 * reminder per vendor — never a notification storm. AI drafts the copy;
 * inventory state is untouched (AI never decides stock).
 *
 * Protect with CRON_SECRET in production.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const staleDays = 14;
  const maxPerReminder = 3;

  const { data: products } = await admin
    .from("products")
    .select(
      "id, title, availability, view_count, carguvi_verified_at, seller_confirmed_at, seller_updated_at, vendors(id, business_name, owner_user_id)",
    )
    .eq("status", "active")
    .neq("availability", "out_of_stock");

  // Group stale products by vendor owner
  const byOwner = new Map<
    string,
    { vendorName: string; stale: { id: string; title: string; daysStale: number; views: number }[] }
  >();
  for (const p of products ?? []) {
    const days = daysSince(
      p.seller_confirmed_at ?? p.seller_updated_at ?? undefined,
    );
    if (days === null || days <= staleDays) continue;
    const owner = (p.vendors as any)?.owner_user_id;
    if (!owner) continue;
    if (!byOwner.has(owner)) {
      byOwner.set(owner, {
        vendorName: (p.vendors as any).business_name,
        stale: [],
      });
    }
    byOwner.get(owner)!.stale.push({
      id: p.id,
      title: p.title,
      daysStale: days,
      views: p.view_count ?? 0,
    });
  }

  const ai = getAIProvider();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  let sent = 0;

  for (const [ownerId, group] of byOwner) {
    // One reminder per vendor per day max.
    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", ownerId)
      .eq("type", "listing_confirmation")
      .gte("created_at", since)
      .limit(1);
    if (recent?.length) continue;

    // Prioritise by customer interest (views), cap the list.
    const top = group.stale
      .sort((a, b) => b.views - a.views)
      .slice(0, maxPerReminder);

    const body = await ai.generateReminderCopy({
      vendorName: group.vendorName,
      listings: top.map((t) => ({ title: t.title, daysStale: t.daysStale })),
    });

    await admin.from("notifications").insert({
      user_id: ownerId,
      type: "listing_confirmation",
      title: `${group.stale.length} listing${group.stale.length === 1 ? "" : "s"} need confirmation`,
      body,
      data: { product_ids: top.map((t) => t.id), total_stale: group.stale.length },
    });
    sent++;
  }

  // ── Review reminders: completed vendor_orders >24h old, not yet reviewed ──
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: completed } = await admin
    .from("vendor_orders")
    .select("id, order_id, vendors(business_name), orders(customer_id, created_at)")
    .eq("status", "completed")
    .lt("updated_at", dayAgo)
    .limit(200);

  let reviewReminders = 0;
  for (const vo of completed ?? []) {
    const customerId = (vo.orders as any)?.customer_id;
    if (!customerId) continue;
    const { data: review } = await admin
      .from("reviews")
      .select("id")
      .eq("vendor_order_id", vo.id)
      .eq("user_id", customerId)
      .limit(1);
    if (review?.length) continue;
    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", customerId)
      .eq("type", "review_reminder")
      .gte("created_at", since)
      .limit(1);
    if (recent?.length) continue;
    await admin.from("notifications").insert({
      user_id: customerId,
      type: "review_reminder",
      title: "How was your part?",
      body: `Tell other buyers how it went with ${(vo.vendors as any)?.business_name ?? "the vendor"}.`,
      data: { vendor_order_id: vo.id },
    });
    reviewReminders++;
  }

  // ── Recompute vendor reliability metrics ──
  const { data: vendors } = await admin
    .from("vendors")
    .select("id")
    .eq("status", "approved");

  for (const v of vendors ?? []) {
    const [{ data: vos }, { data: verifs }, { data: vProds }] =
      await Promise.all([
        admin
          .from("vendor_orders")
          .select("status")
          .eq("vendor_id", v.id),
        admin
          .from("carguvi_verifications")
          .select("price_discrepancy, availability_discrepancy")
          .eq("vendor_id", v.id),
        admin
          .from("products")
          .select("seller_confirmed_at, seller_updated_at, carguvi_verified_at")
          .eq("vendor_id", v.id)
          .eq("status", "active"),
      ]);

    const total = (vos ?? []).length;
    const completed = (vos ?? []).filter((o: any) => o.status === "completed").length;
    const rejected = (vos ?? []).filter((o: any) =>
      ["rejected", "cancelled"].includes(o.status),
    ).length;
    const accurate = (verifs ?? []).filter(
      (x: any) => !x.price_discrepancy && !x.availability_discrepancy,
    ).length;
    const fresh = (vProds ?? []).filter((p: any) => {
      const d = daysSince(p.seller_confirmed_at ?? p.seller_updated_at);
      return d !== null && d <= 14;
    }).length;

    await admin.from("vendor_metrics").upsert(
      {
        vendor_id: v.id,
        fulfilment_rate: total ? (completed / total) * 100 : null,
        cancellation_rate: total ? (rejected / total) * 100 : null,
        stock_accuracy:
          verifs?.length ? (accurate / verifs.length) * 100 : null,
        confirmation_consistency:
          vProds?.length ? (fresh / vProds.length) * 100 : null,
        verification_consistency:
          verifs?.length ? (accurate / verifs.length) * 100 : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "vendor_id" },
    );
  }

  return NextResponse.json({
    ok: true,
    vendors_notified: sent,
    review_reminders: reviewReminders,
    vendors_recomputed: vendors?.length ?? 0,
  });
}
