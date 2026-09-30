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

  // Photos: vehicle + part shots go to the public sourcing-photos bucket.
  async function uploadPhoto(field: string): Promise<string | null> {
    const file = formData.get(field);
    if (!(file instanceof File) || file.size === 0) return null;
    if (file.size > 8 * 1024 * 1024) return null; // 8MB cap
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user?.id ?? "guest"}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("sourcing-photos")
      .upload(path, file);
    if (upErr) return null;
    const { data } = admin.storage.from("sourcing-photos").getPublicUrl(path);
    return data.publicUrl;
  }
  const [vehiclePhoto, partPhoto] = await Promise.all([
    uploadPhoto("vehicle_photo"),
    uploadPhoto("part_photo"),
  ]);

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
    vehicle_photo_url: vehiclePhoto,
    part_photo_url: partPhoto,
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
