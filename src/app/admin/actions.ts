"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRoles } from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";

async function requireAdmin(superOnly = false) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const roles = await getUserRoles(user.id);
  const isSuper = roles.includes("super_admin");
  if (!isSuper && !roles.includes("admin")) redirect("/");
  if (superOnly && !isSuper) redirect("/admin");
  return { user, roles, admin: createAdminClient() };
}

export async function setVendorStatus(
  vendorId: string,
  status: "approved" | "suspended" | "rejected",
) {
  const { user, admin } = await requireAdmin();
  const { data: before } = await admin
    .from("vendors")
    .select("status, owner_user_id, business_name")
    .eq("id", vendorId)
    .single();
  await admin
    .from("vendors")
    .update({
      status,
      is_verified: status === "approved",
      verified_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", vendorId);
  if (before?.owner_user_id) {
    await admin.from("notifications").insert({
      user_id: before.owner_user_id,
      type: "vendor_status",
      title:
        status === "approved"
          ? "Your storefront is live"
          : `Storefront ${status}`,
      body:
        status === "approved"
          ? `${before.business_name} has been verified and approved on Carguvi.`
          : `Your storefront status changed to ${status}. Contact Carguvi support.`,
    });
  }
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "admin",
    action: `vendor_${status}`,
    entity_type: "vendor",
    entity_id: vendorId,
    previous_state: { status: before?.status },
    new_state: { status },
  });
  revalidatePath("/admin/vendors");
}

export async function assignVerificationTask(formData: FormData) {
  const { user, admin } = await requireAdmin();
  const vendorId = String(formData.get("vendor_id"));
  const enumeratorId = String(formData.get("enumerator_id"));
  const productId = String(formData.get("product_id") ?? "") || null;
  const taskType = String(formData.get("task_type") ?? "product_availability");
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;

  const { data, error } = await admin.from("verification_tasks").insert({
    enumerator_id: enumeratorId,
    vendor_id: vendorId,
    product_id: productId,
    task_type: taskType as any,
    due_date: dueDate,
    notes,
    assigned_by: user.id,
  }).select("id").single();
  if (error) throw error;

  await admin.from("notifications").insert({
    user_id: enumeratorId,
    type: "verification_assignment",
    title: "New verification task",
    data: { task_id: data.id },
  });
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "admin",
    action: "verification_task_assigned",
    entity_type: "verification_task",
    entity_id: data.id,
    new_state: { vendor_id: vendorId, enumerator_id: enumeratorId },
  });
  revalidatePath("/admin/verification");
}

export async function resolveDispute(formData: FormData) {
  const { user, admin } = await requireAdmin();
  const id = String(formData.get("dispute_id"));
  const status = String(formData.get("status") ?? "resolved");
  const resolution = String(formData.get("resolution") ?? "") || null;
  const { data: before } = await admin
    .from("disputes")
    .select("status, user_id")
    .eq("id", id)
    .single();
  await admin
    .from("disputes")
    .update({ status: status as any, resolution, resolved_by: user.id })
    .eq("id", id);
  if (before?.user_id) {
    await admin.from("notifications").insert({
      user_id: before.user_id,
      type: "dispute",
      title: `Your report was ${status}`,
      body: resolution ?? undefined,
    });
  }
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "admin",
    action: `dispute_${status}`,
    entity_type: "dispute",
    entity_id: id,
    previous_state: { status: before?.status },
    new_state: { status, resolution },
  });
  revalidatePath("/admin/disputes");
}

export async function setProductStatus(
  productId: string,
  status: Database["public"]["Enums"]["listing_status"],
) {
  const { user, admin } = await requireAdmin();
  const { data: before } = await admin
    .from("products")
    .select("status")
    .eq("id", productId)
    .single();
  await admin.from("products").update({ status }).eq("id", productId);
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "admin",
    action: "product_status_changed",
    entity_type: "product",
    entity_id: productId,
    previous_state: { status: before?.status },
    new_state: { status },
  });
  revalidatePath("/admin/products");
}

export async function grantRole(formData: FormData) {
  const { user, admin } = await requireAdmin(true);
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role")) as any;
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (!profile) throw new Error("No user with that email");
  await admin.from("user_roles").upsert({ user_id: profile.id, role });
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "super_admin",
    action: "role_granted",
    entity_type: "user",
    entity_id: profile.id,
    new_state: { role },
  });
  revalidatePath("/admin/system");
}
