"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function createInquiry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const vendorId = String(formData.get("vendor_id"));
  const { error } = await supabase.from("inquiries").insert({
    vendor_id: vendorId,
    product_id: String(formData.get("product_id") ?? "") || null,
    user_id: user?.id ?? null,
    name: String(formData.get("name") ?? "") || null,
    contact: String(formData.get("contact") ?? "") || null,
    message: String(formData.get("message") ?? ""),
  });
  if (error) throw error;

  // Notify the vendor owner — demand signal.
  const admin = createAdminClient();
  const { data: vendor } = await admin
    .from("vendors")
    .select("owner_user_id")
    .eq("id", vendorId)
    .single();
  if (vendor?.owner_user_id) {
    await admin.from("notifications").insert({
      user_id: vendor.owner_user_id,
      type: "inquiry",
      title: "New customer inquiry",
      body: String(formData.get("message") ?? "").slice(0, 140),
    });
  }
  redirect("/inquiries?sent=1");
}
