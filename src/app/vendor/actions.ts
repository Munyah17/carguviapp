"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorForUser } from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";

type Availability = Database["public"]["Enums"]["availability_status"];
type Condition = Database["public"]["Enums"]["product_condition"];
type VendorOrderStatus = Database["public"]["Enums"]["vendor_order_status"];
type OrderStatus = Database["public"]["Enums"]["order_status"];

async function requireVendor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/vendor");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");
  return { supabase, user, ...info };
}

function staffCan(info: { staffRole: string; vendor: any }, perm: string) {
  // Owners implicitly have all permissions; staff rows carry them in jsonb.
  return info.staffRole === "owner";
}

export interface VendorActionState {
  error?: string;
  ok?: boolean;
}

export async function saveProduct(
  _prev: VendorActionState,
  formData: FormData,
): Promise<VendorActionState> {
  const { supabase, user, vendor } = await requireVendor();

  const productId = String(formData.get("product_id") ?? "") || null;
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    category_id: Number(formData.get("category_id")) || null,
    condition: String(formData.get("condition") ?? "used") as Condition,
    price: Number(formData.get("price")),
    currency: "USD",
    part_number: String(formData.get("part_number") ?? "") || null,
    oem_number: String(formData.get("oem_number") ?? "") || null,
    availability: String(formData.get("availability") ?? "unknown") as Availability,
    quantity:
      formData.get("quantity") === "" || formData.get("quantity") == null
        ? null
        : Number(formData.get("quantity")),
    pickup_available: formData.get("pickup_available") === "on",
    delivery_available: formData.get("delivery_available") === "on",
    status: "active" as const,
    seller_updated_at: new Date().toISOString(),
  };

  if (!payload.title || !payload.price) {
    return { error: "Title and price are required." };
  }

  let id = productId;
  if (productId) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId)
      .eq("vendor_id", vendor.id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, vendor_id: vendor.id })
      .select("id")
      .single();
    if (error) return { error: error.message };
    id = data.id;
    if (!id) return { error: "Save failed." };
    const admin = createAdminClient();
    await admin.from("inventory_events").insert({
      product_id: id,
      actor_id: user.id,
      event_type: "created",
      new_availability: payload.availability as any,
      new_price: payload.price,
    });
  }
  if (!id) return { error: "Save failed." };

  // Compatibility rows â€” parallel arrays, one vehicle fitment per row.
  const makes = formData.getAll("fitment_make");
  const models = formData.getAll("fitment_model");
  const gens = formData.getAll("fitment_generation");
  const engs = formData.getAll("fitment_engine");
  const yStarts = formData.getAll("fitment_year_start");
  const yEnds = formData.getAll("fitment_year_end");

  const numOrNull = (v: FormDataEntryValue | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const fitments = makes
    .map((_, i) => ({
      product_id: id,
      make_id: numOrNull(makes[i]),
      model_id: numOrNull(models[i]),
      generation_id: numOrNull(gens[i]),
      engine_id: numOrNull(engs[i]),
      year_start: numOrNull(yStarts[i]),
      year_end: numOrNull(yEnds[i]),
    }))
    .filter(
      (r) =>
        r.make_id || r.model_id || r.generation_id || r.engine_id ||
        r.year_start || r.year_end,
    );

  const admin2 = createAdminClient();
  if (productId) {
    await admin2
      .from("product_compatibility")
      .delete()
      .eq("product_id", productId);
  }
  if (fitments.length) {
    await admin2.from("product_compatibility").insert(fitments);
  }

  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (imageUrl) {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("product_images")
      .select("id, url")
      .eq("product_id", id)
      .order("sort_order")
      .limit(1);
    if (existing?.[0]?.url !== imageUrl) {
      if (existing?.[0]) {
        await admin
          .from("product_images")
          .update({ url: imageUrl })
          .eq("id", existing[0].id);
      } else {
        await admin
          .from("product_images")
          .insert({ product_id: id, url: imageUrl, sort_order: 0 });
      }
    }
  }

  revalidatePath("/vendor/products");
  redirect("/vendor/products");
}

export async function updateAvailability(
  productId: string,
  availability: string,
) {
  const { supabase, user, vendor } = await requireVendor();
  const { data: before } = await supabase
    .from("products")
    .select("availability")
    .eq("id", productId)
    .single();
  const { error } = await supabase
    .from("products")
    .update({
      availability: availability as Availability,
      status: availability === "sold" ? "sold" : "active",
      seller_updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("vendor_id", vendor.id);
  if (error) return;
  const admin = createAdminClient();
  await admin.from("inventory_events").insert({
    product_id: productId,
    actor_id: user.id,
    event_type: "availability_change",
    old_availability: before?.availability as any,
    new_availability: availability as any,
  });
  revalidatePath("/vendor/products");
}

export async function confirmListing(productId: string, response: "available" | "sold") {
  const { supabase, user, vendor } = await requireVendor();
  const now = new Date().toISOString();

  const admin = createAdminClient();
  await admin.from("seller_confirmations").insert({
    product_id: productId,
    vendor_id: vendor.id,
    confirmed_by: user.id,
    response,
    source: "dashboard",
  });

  await admin
    .from("products")
    .update({
      seller_confirmed_at: now,
      availability: (response === "available" ? "in_stock" : "out_of_stock") as Availability,
      status: response === "sold" ? "sold" : "active",
    })
    .eq("id", productId);

  await admin.from("inventory_events").insert({
    product_id: productId,
    actor_id: user.id,
    event_type: "seller_confirmed",
    new_availability: response === "available" ? "in_stock" : "out_of_stock",
  });
  revalidatePath("/vendor/confirmations");
  revalidatePath("/vendor");
}

/** Bulk confirm â€” the "Confirm all available" action. */
export async function confirmAllListings(productIds: string[]) {
  for (const id of productIds) {
    await confirmListing(id, "available");
  }
}

const NEXT_VENDOR_STATUS: Record<string, string> = {
  paid: "accepted",
  accepted: "preparing",
  preparing_pickup: "ready_for_pickup",
  preparing_delivery: "out_for_delivery",
  ready_for_pickup: "collected",
  out_for_delivery: "delivered",
  collected: "completed",
  delivered: "completed",
};

export async function advanceVendorOrder(vendorOrderId: string) {
  const { supabase, user, vendor } = await requireVendor();
  const admin = createAdminClient();

  const { data: vo } = await admin
    .from("vendor_orders")
    .select("id, status, fulfillment_type, order_id, vendor_id")
    .eq("id", vendorOrderId)
    .eq("vendor_id", vendor.id)
    .single();
  if (!vo) return;

  const key =
    vo.status === "preparing"
      ? `preparing_${vo.fulfillment_type}`
      : vo.status;
  const next = NEXT_VENDOR_STATUS[key];
  if (!next) return;

  await admin
    .from("vendor_orders")
    .update({ status: next as VendorOrderStatus })
    .eq("id", vendorOrderId);

  // Propagate to parent order
  const { data: siblings } = await admin
    .from("vendor_orders")
    .select("status")
    .eq("order_id", vo.order_id);
  const statuses = (siblings ?? []).map((s: any) => s.status);
  let parentStatus: string | null = null;
  if (statuses.every((s: string) => s === "completed")) parentStatus = "completed";
  else if (statuses.every((s: string) => ["completed", "cancelled", "rejected", "refunded"].includes(s)))
    parentStatus = "partially_completed";
  else if (statuses.some((s: string) => !["pending_payment", "paid"].includes(s)))
    parentStatus = "in_fulfilment";
  if (parentStatus) {
    await admin.from("orders").update({ status: parentStatus as OrderStatus }).eq("id", vo.order_id);
  }

  // Notify customer
  const { data: order } = await admin
    .from("orders")
    .select("customer_id")
    .eq("id", vo.order_id)
    .single();
  if (order?.customer_id) {
    await admin.from("notifications").insert({
      user_id: order.customer_id,
      type: "order",
      title:
        next === "ready_for_pickup"
          ? "Your order is ready for pickup"
          : `Order update: ${next.replace(/_/g, " ")}`,
      data: { order_id: vo.order_id },
    });
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "vendor",
    action: "vendor_order_status",
    entity_type: "vendor_order",
    entity_id: vendorOrderId,
    previous_state: { status: vo.status },
    new_state: { status: next },
  });

  revalidatePath("/vendor/orders");
}

export async function rejectVendorOrder(vendorOrderId: string, reason?: string) {
  const { user, vendor } = await requireVendor();
  const admin = createAdminClient();
  const { data: vo } = await admin
    .from("vendor_orders")
    .select("id, order_id")
    .eq("id", vendorOrderId)
    .eq("vendor_id", vendor.id)
    .single();
  if (!vo) return;
  await admin
    .from("vendor_orders")
    .update({ status: "rejected", vendor_note: reason ?? null })
    .eq("id", vendorOrderId);
  const { data: order } = await admin
    .from("orders")
    .select("customer_id")
    .eq("id", vo.order_id)
    .single();
  if (order?.customer_id) {
    await admin.from("notifications").insert({
      user_id: order.customer_id,
      type: "order",
      title: "A vendor could not fulfil your order",
      body: reason ?? "The item is unavailable. Carguvi will assist with a refund or alternative.",
      data: { order_id: vo.order_id },
    });
  }
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "vendor",
    action: "vendor_order_rejected",
    entity_type: "vendor_order",
    entity_id: vendorOrderId,
    new_state: { reason },
  });
  revalidatePath("/vendor/orders");
}

export async function applyToSell(_prev: VendorActionState, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "sign_in_required" };

  const businessName = String(formData.get("business_name") ?? "").trim();
  if (!businessName) return { error: "Business name is required." };

  const slug =
    businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  // Upload business documents (registration, ID) to private storage.
  const admin0 = createAdminClient();
  const docUrls: string[] = [];
  for (const file of formData.getAll("documents")) {
    if (!(file instanceof File) || file.size === 0) continue;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await admin0.storage
      .from("vendor-documents")
      .upload(path, file);
    if (!upErr) {
      const { data: signed } = await admin0.storage
        .from("vendor-documents")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      docUrls.push(signed?.signedUrl ?? path);
    }
  }

  const { data: vendor, error } = await supabase
    .from("vendors")
    .insert({
      owner_user_id: user.id,
      business_name: businessName,
      slug,
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      contact_person: String(formData.get("contact_person") ?? "") || null,
      physical_address: String(formData.get("physical_address") ?? ""),
      operating_area: String(formData.get("operating_area") ?? "") || null,
      city: String(formData.get("city") ?? "Harare"),
      description: String(formData.get("description") ?? "") || null,
      business_documents: docUrls,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const admin = createAdminClient();
  // Vendor role is granted immediately so they can prepare their storefront;
  // public visibility requires admin approval (status = approved).
  await admin
    .from("user_roles")
    .upsert({ user_id: user.id, role: "vendor" });
  await admin.from("vendor_locations").insert({
    vendor_id: vendor.id,
    name: "Main shop",
    address: String(formData.get("physical_address") ?? ""),
    area: String(formData.get("operating_area") ?? "") || null,
    city: String(formData.get("city") ?? "Harare"),
    is_primary: true,
  });
  await admin.from("vendor_metrics").insert({ vendor_id: vendor.id });
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "vendor",
    action: "vendor_application_submitted",
    entity_type: "vendor",
    entity_id: vendor.id,
    new_state: { business_name: businessName },
  });
  redirect("/vendor");
}

export async function updateVendorProfile(
  _prev: VendorActionState,
  formData: FormData,
) {
  const { supabase, vendor } = await requireVendor();
  const { error } = await supabase
    .from("vendors")
    .update({
      business_name: String(formData.get("business_name") ?? vendor.business_name),
      description: String(formData.get("description") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      whatsapp: String(formData.get("whatsapp") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      operating_area: String(formData.get("operating_area") ?? "") || null,
      city: String(formData.get("city") ?? "Harare"),
      payment_details: {
        ecocash: String(formData.get("ecocash") ?? "") || undefined,
        bank: String(formData.get("bank") ?? "") || undefined,
        innbucks: String(formData.get("innbucks") ?? "") || undefined,
      },
    })
    .eq("id", vendor.id);
  if (error) return { error: error.message };
  revalidatePath("/vendor/settings");
  return { ok: true };
}

export async function savePickupLocation(formData: FormData) {
  const { supabase, vendor } = await requireVendor();
  const id = String(formData.get("location_id") ?? "") || null;
  const payload = {
    vendor_id: vendor.id,
    name: String(formData.get("name") ?? "Main shop"),
    address: String(formData.get("address") ?? ""),
    area: String(formData.get("area") ?? "") || null,
    pickup_available: formData.get("pickup_available") === "on",
    pickup_instructions:
      String(formData.get("pickup_instructions") ?? "") || null,
    delivery_available: formData.get("delivery_available") === "on",
  };
  const { error } = id
    ? await supabase.from("vendor_locations").update(payload).eq("id", id).eq("vendor_id", vendor.id)
    : await supabase.from("vendor_locations").insert(payload);
  if (error) throw error;
  revalidatePath("/vendor/settings");
}

/** Mark one branch as the primary pickup location. */
export async function setPrimaryLocation(locationId: string) {
  const { supabase, vendor } = await requireVendor();
  await supabase
    .from("vendor_locations")
    .update({ is_primary: false })
    .eq("vendor_id", vendor.id);
  const { error } = await supabase
    .from("vendor_locations")
    .update({ is_primary: true })
    .eq("id", locationId)
    .eq("vendor_id", vendor.id);
  if (error) throw error;
  revalidatePath("/vendor/settings");
}

/** Remove a branch. The primary location can't be deleted. */
export async function deleteLocation(locationId: string) {
  const { supabase, vendor } = await requireVendor();
  const { data: loc } = await supabase
    .from("vendor_locations")
    .select("is_primary")
    .eq("id", locationId)
    .eq("vendor_id", vendor.id)
    .single();
  if (loc?.is_primary) {
    return { error: "Set another branch as primary before removing this one." };
  }
  const { error } = await supabase
    .from("vendor_locations")
    .delete()
    .eq("id", locationId)
    .eq("vendor_id", vendor.id);
  if (error) throw error;
  revalidatePath("/vendor/settings");
}

export async function setStaffActive(staffId: string, active: boolean) {
  const { supabase, user, vendor, staffRole } = await requireVendor();
  if (staffRole !== "owner") return;
  const { error } = await supabase
    .from("vendor_staff")
    .update({ is_active: active })
    .eq("id", staffId)
    .eq("vendor_id", vendor.id);
  if (error) throw error;
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "vendor",
    action: active ? "staff_activated" : "staff_deactivated",
    entity_type: "vendor_staff",
    entity_id: staffId,
    new_state: { is_active: active },
  });
  revalidatePath("/vendor/staff");
}

/**
 * Create an employee login for the shop — vendor sets the credentials, we
 * create the auth account (confirmed, no email needed), profile is auto-created
 * by the handle_new_user trigger, then linked to the shop via vendor_staff.
 */
export async function addStaffMember(formData: FormData) {
  const { vendor, staffRole, user } = await requireVendor();
  if (staffRole !== "owner" && staffRole !== "manager") {
    return { error: "Only the owner or a manager can add staff." } as never;
  }
  const admin = createAdminClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("staff_role") ?? "shop_assistant");

  if (!email || !password) {
    return { error: "Email and password are required." } as never;
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." } as never;
  }

  // Existing Carguvi account → just link it; otherwise create the login.
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let userId = existing?.id as string | undefined;
  if (!userId) {
    const { data: created, error: ce } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, role: "staff" },
    });
    if (ce || !created.user) {
      return { error: ce?.message ?? "Could not create the account." } as never;
    }
    userId = created.user.id;
  }

  await admin.from("vendor_staff").upsert(
    {
      vendor_id: vendor.id,
      user_id: userId,
      staff_role: role,
      permissions: {
        manage_products: formData.get("perm_products") === "on",
        manage_orders: formData.get("perm_orders") === "on",
        confirm_listings: formData.get("perm_confirm") === "on",
      },
    },
    { onConflict: "vendor_id,user_id" },
  );
  await admin.from("user_roles").upsert({ user_id: userId, role: "staff" });
  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "vendor",
    action: "staff_account_created",
    entity_type: "vendor_staff",
    entity_id: vendor.id,
    new_state: { email, staff_role: role },
  });
  revalidatePath("/vendor/staff");
}
