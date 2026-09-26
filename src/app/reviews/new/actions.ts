"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { error } = await supabase.from("reviews").insert({
    vendor_order_id: String(formData.get("vendor_order_id")),
    vendor_id: String(formData.get("vendor_id")),
    product_id: String(formData.get("product_id") ?? "") || null,
    user_id: user.id,
    rating: Number(formData.get("rating")),
    comment: String(formData.get("comment") ?? "") || null,
  });
  if (error) throw error;
  redirect("/orders");
}
