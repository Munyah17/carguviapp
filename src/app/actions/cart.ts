"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureUser } from "@/lib/guest";
import { revalidatePath } from "next/cache";

async function getOrCreateCart(supabase: any, userId: string) {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id as string;
  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function addToCart(productId: string, quantity = 1) {
  const supabase = await createClient();
  // Guests shop anonymously — the session upgrades to a full account on signup.
  const user = await ensureUser(supabase);
  if (!user) return { error: "sign_in_required" };

  const { data: product } = await supabase
    .from("products")
    .select("id, price, availability, status")
    .eq("id", productId)
    .single();
  if (!product || product.status !== "active") {
    return { error: "This product is no longer available." };
  }

  const cartId = await getOrCreateCart(supabase, user.id);
  const { error } = await supabase.from("cart_items").upsert(
    {
      cart_id: cartId,
      product_id: productId,
      quantity,
      unit_price: product.price,
    },
    { onConflict: "cart_id,product_id" },
  );
  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { ok: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "sign_in_required" };
  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  }
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCartItem(itemId: string) {
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/cart");
  return { ok: true };
}
