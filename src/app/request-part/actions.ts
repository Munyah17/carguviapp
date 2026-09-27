"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function submitSourcingRequest(_prev: { error?: string }, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const partName = String(formData.get("part_name") ?? "").trim();
  const contact =
    String(formData.get("contact") ?? "").trim() ||
    (user?.email ?? "");
  if (!partName) return { error: "Tell us which part you need." };
  if (!contact) return { error: "We need a phone number, WhatsApp or email to send your quotation." };

  const admin = createAdminClient();
  const { error } = await admin.from("sourcing_requests").insert({
    user_id: user?.id ?? null,
    name: String(formData.get("name") ?? "") || null,
    contact,
    vehicle_description: String(formData.get("vehicle") ?? "") || null,
    part_name: partName,
    part_number: String(formData.get("part_number") ?? "") || null,
    condition_pref: String(formData.get("condition") ?? "any"),
    quantity: Math.max(1, Number(formData.get("quantity")) || 1),
    notes: String(formData.get("notes") ?? "") || null,
    source_pref: String(formData.get("source") ?? "any"),
  });
  if (error) return { error: error.message };

  // Notify ops — sourcing desk should respond within 48h.
  const { data: admins } = await admin
    .from("user_roles")
    .select("user_id")
    .in("role", ["admin", "super_admin"]);
  for (const a of admins ?? []) {
    await admin.from("notifications").insert({
      user_id: a.user_id,
      type: "sourcing_request",
      title: "New import request",
      body: `${partName} — respond within 48h with a quote and timeline.`,
    });
  }

  redirect("/request-part/sent");
}
