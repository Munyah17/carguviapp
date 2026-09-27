import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/services/payments";

/**
 * Paynow server-to-server result URL. Paynow POSTs transaction status here
 * after the customer pays. We verify via the provider and mark the order
 * payment confirmed (idempotent — safe to receive duplicates).
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const reference = params.get("reference");
  const status = params.get("status")?.toLowerCase();
  if (!reference) {
    return NextResponse.json({ error: "missing reference" }, { status: 400 });
  }

  if (status !== "paid" && status !== "delivered") {
    return NextResponse.json({ ok: true, ignored: status });
  }

  const provider = getPaymentProvider();
  const result = await provider.verify(reference);
  if (result.status !== "confirmed") {
    return NextResponse.json({ ok: false, result: result.status });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .update({ status: "confirmed" })
    .eq("reference", reference)
    .in("status", ["initiated", "pending"])
    .select("id, order_id")
    .single();

  if (payment?.order_id) {
    await admin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", payment.order_id)
      .eq("status", "pending_payment");
    await admin
      .from("vendor_orders")
      .update({ status: "paid" })
      .eq("order_id", payment.order_id)
      .eq("status", "pending_payment");
  }
  return NextResponse.json({ ok: true });
}
