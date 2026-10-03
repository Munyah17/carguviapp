"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUser } from "@/lib/guest";
import { getPaymentProvider } from "@/lib/services/payments";
import { getDeliveryProvider } from "@/lib/services/delivery";
import { redirect } from "next/navigation";

export async function placeOrder(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  // Guests check out under an anonymous session.
  const user = await ensureUser(supabase);
  if (!user) return { error: "sign_in_required" };

  const paymentMethod = String(formData.get("payment_method") ?? "cash_on_pickup");
  let addressId = String(formData.get("address_id") ?? "") || null;

  // Guest contact details — vendors need a name and phone to coordinate.
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestPhone = String(formData.get("guest_phone") ?? "").trim();
  if (guestName || guestPhone) {
    await supabase
      .from("profiles")
      .update({
        full_name: guestName || undefined,
        phone: guestPhone || undefined,
      })
      .eq("id", user.id);
  }

  // Optional account creation at checkout — converts the anonymous guest
  // session into a permanent account, keeping this order's history attached.
  const newEmail = String(formData.get("new_email") ?? "").trim();
  const newPassword = String(formData.get("new_password") ?? "");
  if (newEmail && newPassword && user.is_anonymous) {
    if (newPassword.length < 6) {
      return { error: "Password must be at least 6 characters — or leave the account fields empty." };
    }
    const { error: upErr } = await supabase.auth.updateUser({
      email: newEmail,
      password: newPassword,
      data: { full_name: guestName || undefined, phone: guestPhone || undefined },
    });
    if (upErr && !upErr.message.toLowerCase().includes("already")) {
      return { error: `Order not placed — ${upErr.message}. Leave the account fields empty to check out as guest.` };
    }
  }

  // Inline address for guests / users with no saved addresses.
  const line1 = String(formData.get("addr_line1") ?? "").trim();
  if (!addressId && line1) {
    const { data: addr } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: "Delivery address",
        recipient_name: guestName || null,
        phone: guestPhone || null,
        line1,
        area: String(formData.get("addr_area") ?? "").trim() || null,
        city: String(formData.get("addr_city") ?? "").trim() || "Harare",
        is_default: true,
      })
      .select("id")
      .single();
    addressId = addr?.id ?? null;
  }

  // Load cart
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!cart) return { error: "Your cart is empty." };

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, unit_price,
       products(id, title, condition, availability, quantity, vendor_id,
                vendors(id, business_name, owner_user_id),
                vendor_id)`,
    )
    .eq("cart_id", cart.id);

  if (!items?.length) return { error: "Your cart is empty." };

  const unavailable = items.find(
    (i: any) => i.products?.availability === "out_of_stock",
  );
  if (unavailable) {
    return {
      error: `"${unavailable.products.title}" is no longer available. Remove it to continue.`,
    };
  }

  // Group by vendor
  const groups = new Map<string, any[]>();
  for (const item of items) {
    const vid = (item as any).products.vendor_id;
    if (!groups.has(vid)) groups.set(vid, []);
    groups.get(vid)!.push(item);
  }

  // Destination address coords for delivery quote
  let destLat: number | null = null;
  let destLng: number | null = null;
  if (addressId) {
    const { data: addr } = await supabase
      .from("addresses")
      .select("latitude, longitude")
      .eq("id", addressId)
      .single();
    destLat = addr?.latitude ?? null;
    destLng = addr?.longitude ?? null;
  }

  const delivery = getDeliveryProvider();
  const payment = getPaymentProvider();

  // Build vendor orders with fulfilment + fees
  const vendorOrders: {
    vendorId: string;
    fulfillment: "pickup" | "delivery";
    pickupLocationId: string | null;
    items: any[];
    subtotal: number;
    deliveryFee: number;
  }[] = [];

  for (const [vendorId, vItems] of groups) {
    const fulfillment =
      (String(formData.get(`fulfilment_${vendorId}`)) as "pickup" | "delivery") ||
      "pickup";

    // Primary pickup location for this vendor
    const { data: loc } = await supabase
      .from("vendor_locations")
      .select("id, latitude, longitude")
      .eq("vendor_id", vendorId)
      .eq("is_primary", true)
      .maybeSingle();

    let deliveryFee = 0;
    if (fulfillment === "delivery") {
      if (!addressId) {
        return { error: "Enter a delivery address, or choose pickup." };
      }
      const quote = await delivery.quote({
        originLat: loc?.latitude ?? null,
        originLng: loc?.longitude ?? null,
        destLat,
        destLng,
      });
      if (!quote.serviceable) {
        return {
          error: "Delivery is not available to that address. Choose pickup instead.",
        };
      }
      deliveryFee = quote.fee;
    }

    vendorOrders.push({
      vendorId,
      fulfillment,
      pickupLocationId: fulfillment === "pickup" ? (loc?.id ?? null) : null,
      items: vItems,
      subtotal: vItems.reduce(
        (s, i) => s + Number(i.unit_price) * i.quantity,
        0,
      ),
      deliveryFee,
    });
  }

  const subtotal = vendorOrders.reduce((s, v) => s + v.subtotal, 0);
  const deliveryFee = vendorOrders.reduce((s, v) => s + v.deliveryFee, 0);
  const total = subtotal + deliveryFee;

  // Create the parent order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "pending_payment",
      currency: "USD",
      subtotal,
      delivery_fee: deliveryFee,
      total,
      delivery_address_id: addressId,
    })
    .select("id")
    .single();
  if (orderErr || !order) return { error: orderErr?.message ?? "Order failed" };

  const admin = createAdminClient();

  for (const vo of vendorOrders) {
    const { data: voRow, error: voErr } = await supabase
      .from("vendor_orders")
      .insert({
        order_id: order.id,
        vendor_id: vo.vendorId,
        status: "pending_payment",
        fulfillment_type: vo.fulfillment,
        pickup_location_id: vo.pickupLocationId,
        subtotal: vo.subtotal,
        delivery_fee: vo.deliveryFee,
      })
      .select("id")
      .single();
    if (voErr || !voRow) {
      return { error: voErr?.message ?? "Order failed" };
    }
    await admin.from("order_items").insert(
      vo.items.map((i) => ({
        vendor_order_id: voRow.id,
        product_id: i.products.id,
        title: i.products.title,
        condition: i.products.condition,
        unit_price: i.unit_price,
        quantity: i.quantity,
      })),
    );
    if (vo.fulfillment === "delivery" && addressId) {
      await admin.from("deliveries").insert({
        vendor_order_id: voRow.id,
        provider: delivery.name,
        status: "pending",
        address_id: addressId,
        fee: vo.deliveryFee,
      });
    }
  }

  // Payment via provider abstraction (mock in dev)
  const result = await payment.initiate({
    provider: payment.name,
    method: paymentMethod,
    amount: total,
    currency: "USD",
    reference: `ORDER-${order.id}`,
  });

  await admin.from("payments").insert({
    order_id: order.id,
    provider: payment.name,
    method: paymentMethod,
    amount: total,
    currency: "USD",
    status: result.status === "confirmed" ? "confirmed" : "pending",
    reference: result.reference,
  });

  if (result.status === "confirmed" || paymentMethod === "cash_on_pickup") {
    await admin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);
    await admin
      .from("vendor_orders")
      .update({ status: "paid" })
      .eq("order_id", order.id);

    // Reserve single-unit / used inventory
    for (const vo of vendorOrders) {
      for (const i of vo.items) {
        const p = i.products;
        if (p.quantity == null || p.quantity <= i.quantity) {
          await admin
            .from("products")
            .update({ availability: "out_of_stock" })
            .eq("id", p.id);
        } else {
          await admin
            .from("products")
            .update({ quantity: p.quantity - i.quantity })
            .eq("id", p.id);
        }
        await admin.from("inventory_events").insert({
          product_id: p.id,
          actor_id: user.id,
          event_type: "order_reserved",
          new_availability:
            p.quantity == null || p.quantity <= i.quantity
              ? "out_of_stock"
              : null,
          note: `Reserved by order ${order.id}`,
        });
      }
    }

    // Notify each vendor owner
    for (const vo of vendorOrders) {
      const ownerId = (vo.items[0] as any).products?.vendors?.owner_user_id;
      if (ownerId) {
        await admin.from("notifications").insert({
          user_id: ownerId,
          type: "order",
          title: "New order received",
          body: `${vo.items.length} item(s) — ${vo.fulfillment === "pickup" ? "customer pickup" : "Carguvi Delivery"}.`,
          data: { order_id: order.id },
        });
      }
    }
  }

  // Clear cart
  await admin.from("cart_items").delete().eq("cart_id", cart.id);

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "customer",
    action: "order_placed",
    entity_type: "order",
    entity_id: order.id,
    new_state: { total, vendors: vendorOrders.length, payment: result.status },
  });

  redirect(`/orders/${order.id}?placed=1`);
}
