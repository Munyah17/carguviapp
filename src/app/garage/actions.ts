"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addVehicle(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const makeId = Number(formData.get("make_id"));
  const modelId = Number(formData.get("model_id"));
  const generationId = Number(formData.get("generation_id")) || null;
  const engineId = Number(formData.get("engine_id")) || null;
  const year = Number(formData.get("year")) || null;
  const nickname = String(formData.get("nickname") ?? "").trim() || null;
  const isPrimary = formData.get("is_primary") === "on";

  if (!makeId || !modelId) throw new Error("Make and model are required");

  if (isPrimary) {
    await supabase
      .from("customer_vehicles")
      .update({ is_primary: false })
      .eq("user_id", user.id);
  }

  const { error } = await supabase.from("customer_vehicles").insert({
    user_id: user.id,
    make_id: makeId,
    model_id: modelId,
    generation_id: generationId,
    engine_id: engineId,
    year,
    nickname,
    is_primary: isPrimary,
  });
  if (error) throw error;
  redirect("/garage");
}

export async function removeVehicle(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("customer_vehicles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/garage");
}
