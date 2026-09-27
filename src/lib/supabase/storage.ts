"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Upload a product image to the `product-images` bucket under
 * `<vendorId>/<uuid>.<ext>` and return its public URL.
 * RLS requires the caller to have `manage_products` on that vendor.
 */
export async function uploadProductImage(
  file: File,
  vendorId: string,
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${vendorId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
