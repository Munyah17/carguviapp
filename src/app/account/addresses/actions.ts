"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isDefault = formData.get("is_default") === "on";
  if (isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  await supabase.from("addresses").insert({
    user_id: user.id,
    label: String(formData.get("label") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    line1: String(formData.get("line1") ?? ""),
    area: String(formData.get("area") ?? "") || null,
    city: String(formData.get("city") ?? "Harare"),
    is_default: isDefault,
  });
  revalidatePath("/account/addresses");
}

export async function removeAddress(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
}
