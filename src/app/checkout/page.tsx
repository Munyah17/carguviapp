import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "./actions";
import { CheckoutForm } from "./checkout-form";
import { IconPin, IconStore, IconTruck } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Guests check out under an anonymous session — no account required.
  // Anyone without a session has no cart, so bounce to the empty cart page.
  if (!user) redirect("/cart");

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: items } = cart
    ? await supabase
        .from("cart_items")
        .select(
          `id, quantity, unit_price,
           products(id, title, condition, availability,
                    pickup_available, delivery_available,
                    vendors(id, business_name, slug,
                            vendor_locations(id, name, address, area, pickup_available, delivery_available)))`,
        )
        .eq("cart_id", cart.id)
    : { data: [] };

  if (!items?.length) redirect("/cart");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  const groups = new Map<string, any[]>();
  for (const item of items) {
    const vid = (item as any).products.vendors.id;
    if (!groups.has(vid)) groups.set(vid, []);
    groups.get(vid)!.push(item);
  }

  const subtotal = items.reduce(
    (s, i) => s + Number(i.unit_price) * i.quantity,
    0,
  );

  const groupData = [...groups.entries()].map(([vendorId, vItems]) => ({
    vendorId,
    vendor: (vItems[0] as any).products.vendors,
    items: vItems.map((i: any) => ({
      id: i.id,
      title: i.products.title,
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      pickup_available: i.products.pickup_available,
      delivery_available: i.products.delivery_available,
    })),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:pb-10">
      <h1 className="text-xl font-bold text-ink-900">Checkout</h1>
      <CheckoutForm
        groups={groupData}
        addresses={addresses ?? []}
        subtotal={subtotal}
        defaultName={profile?.full_name ?? ""}
        defaultPhone={profile?.phone ?? ""}
        action={placeOrder}
      />
    </div>
  );
}
