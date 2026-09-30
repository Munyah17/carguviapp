"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRoles } from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";

async function requireEnumerator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const roles = await getUserRoles(user.id);
  if (!roles.includes("enumerator") && !roles.includes("admin") && !roles.includes("super_admin")) {
    redirect("/");
  }
  return { supabase, user };
}

export async function startTask(taskId: string) {
  const { supabase } = await requireEnumerator();
  await supabase
    .from("verification_tasks")
    .update({ status: "started", started_at: new Date().toISOString() })
    .eq("id", taskId);
  revalidatePath(`/enumerator/tasks/${taskId}`);
}

export async function submitVerification(formData: FormData) {
  const { supabase, user } = await requireEnumerator();
  const admin = createAdminClient();

  const taskId = String(formData.get("task_id"));
  const { data: task } = await supabase
    .from("verification_tasks")
    .select("*, products(price, availability)")
    .eq("id", taskId)
    .single();
  if (!task) return;

  const observedAvailability = (String(
    formData.get("observed_availability") ?? "",
  ) || null) as Database["public"]["Enums"]["availability_status"] | null;
  const observedPrice =
    formData.get("observed_price") === "" || formData.get("observed_price") == null
      ? null
      : Number(formData.get("observed_price"));
  const notes = String(formData.get("notes") ?? "") || null;
  const photoUrl = String(formData.get("photo_url") ?? "") || null;
  const listedPrice = task.products?.price != null ? Number(task.products.price) : null;
  const listedAvailability = task.products?.availability ?? null;

  // Record discrepancies rather than overwriting vendor data.
  const priceDiscrepancy =
    observedPrice != null && listedPrice != null && observedPrice !== listedPrice;
  const availabilityDiscrepancy =
    observedAvailability != null &&
    listedAvailability != null &&
    observedAvailability !== listedAvailability;

  const { data: verification } = await admin
    .from("carguvi_verifications")
    .insert({
      task_id: taskId,
      enumerator_id: user.id,
      vendor_id: task.vendor_id,
      product_id: task.product_id,
      observed_availability: observedAvailability,
      observed_price: observedPrice,
      price_discrepancy: priceDiscrepancy,
      availability_discrepancy: availabilityDiscrepancy,
      notes,
      shop_verified: task.task_type === "shop_check" ? true : null,
    })
    .select("id")
    .single();

  if (photoUrl && verification) {
    await admin.from("verification_photos").insert({
      verification_id: verification.id,
      url: photoUrl,
    });
  }

  // Carguvi confirmation stamp â€” the product's public freshness timestamp.
  if (task.product_id) {
    await admin
      .from("products")
      .update({ carguvi_verified_at: new Date().toISOString() })
      .eq("id", task.product_id);
    await admin.from("inventory_events").insert({
      product_id: task.product_id,
      actor_id: user.id,
      event_type: "carguvi_verified",
      new_availability: observedAvailability as any,
      note: priceDiscrepancy
        ? `Price discrepancy: listed $${listedPrice}, observed $${observedPrice}`
        : null,
    });
  }

  await admin
    .from("verification_tasks")
    .update({
      status: priceDiscrepancy || availabilityDiscrepancy ? "flagged" : "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "enumerator",
    action: "carguvi_verification_submitted",
    entity_type: "verification_task",
    entity_id: taskId,
    new_state: {
      product_id: task.product_id,
      observed_availability: observedAvailability,
      observed_price: observedPrice,
      price_discrepancy: priceDiscrepancy,
    },
  });

  redirect("/enumerator?done=1");
}
