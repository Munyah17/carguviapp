"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";

export async function createDispute(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const orderId = String(formData.get("order_id") ?? "") || null;
  const vendorOrderId = String(formData.get("vendor_order_id") ?? "") || null;
  const vendorId = String(formData.get("vendor_id") ?? "") || null;

  const { data, error } = await supabase
    .from("disputes")
    .insert({
      order_id: orderId,
      vendor_order_id: vendorOrderId,
      vendor_id: vendorId,
      user_id: user.id,
      dispute_type: String(
        formData.get("dispute_type") ?? "other",
      ) as Database["public"]["Enums"]["dispute_type"],
      description: String(formData.get("description") ?? ""),
    })
    .select("id")
    .single();
  if (error) throw error;

  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "customer",
    action: "dispute_opened",
    entity_type: "dispute",
    entity_id: data.id,
    new_state: { order_id: orderId, vendor_id: vendorId },
  });

  redirect(`/orders${orderId ? `/${orderId}` : ""}?reported=1`);
}
