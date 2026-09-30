"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function createReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const vendorId = String(formData.get("vendor_id"));
  const productRating = Number(formData.get("product_rating")) || null;
  const vendorRating = Number(formData.get("vendor_rating")) || null;

  const { error } = await supabase.from("reviews").insert({
    vendor_order_id: String(formData.get("vendor_order_id")),
    vendor_id: vendorId,
    product_id: String(formData.get("product_id") ?? "") || null,
    user_id: user.id,
    rating: vendorRating ?? productRating ?? 3,
    product_rating: productRating,
    vendor_rating: vendorRating,
    comment: String(formData.get("comment") ?? "") || null,
  });
  if (error) throw error;

  // Recompute vendor rating rollup.
  const admin = createAdminClient();
  const { data: agg } = await admin
    .from("reviews")
    .select("vendor_rating, rating")
    .eq("vendor_id", vendorId);
  if (agg?.length) {
    const ratings = agg.map((r: any) => r.vendor_rating ?? r.rating);
    const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
    await admin
      .from("vendors")
      .update({ rating: Math.round(avg * 100) / 100, review_count: ratings.length })
      .eq("id", vendorId);
  }

  redirect("/orders");
}
