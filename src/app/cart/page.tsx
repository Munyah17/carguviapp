import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateCartItem, removeCartItem } from "@/app/actions/cart";
import { IconCart } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cart" };

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Guests shop anonymously — no session just means the cart is empty.

  const { data: cart } = user
    ? await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: items } = cart
    ? await supabase
        .from("cart_items")
        .select(
          `id, quantity, unit_price,
           products(id, title, availability, condition, currency,
                    product_images(url, sort_order),
                    vendors(id, business_name, slug))`,
        )
        .eq("cart_id", cart.id)
    : { data: [] };

  const groups = new Map<string, any[]>();
  for (const item of items ?? []) {
    const v = (item as any).products?.vendors;
    const key = v?.id ?? "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const total = (items ?? []).reduce(
    (s, i) => s + Number(i.unit_price) * i.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:pb-10">
      <h1 className="text-xl font-bold text-ink-900">Cart</h1>

      {groups.size === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center">
          <IconCart className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 font-medium text-ink-700">Your cart is empty</p>
          <ButtonLink href="/search" className="mt-4">
            Browse parts
          </ButtonLink>
        </div>
      ) : (
        <>
          {[...groups.entries()].map(([vendorId, vendorItems]) => {
            const v = (vendorItems[0] as any).products?.vendors;
            return (
              <section
                key={vendorId}
                className="mt-4 rounded-xl border border-surface-200 bg-white"
              >
                <h2 className="border-b border-surface-200 px-4 py-3 text-sm font-semibold text-ink-900">
                  <Link href={`/vendors/${v?.slug}`} className="hover:text-brand-700">
                    {v?.business_name ?? "Vendor"}
                  </Link>
                  <span className="ml-2 text-xs font-normal text-ink-400">
                    Fulfilled separately
                  </span>
                </h2>
                <ul className="divide-y divide-surface-100">
                  {vendorItems.map((item: any) => {
                    const p = item.products;
                    const img = (p?.product_images ?? []).sort(
                      (a: any, b: any) => a.sort_order - b.sort_order,
                    )[0];
                    const unavailable = p?.availability === "out_of_stock";
                    return (
                      <li key={item.id} className="flex gap-3 p-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-100">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img.url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${p?.id}`}
                            className="line-clamp-2 text-sm font-medium text-ink-900"
                          >
                            {p?.title}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2 text-xs">
                            <span className="capitalize text-ink-500">
                              {p?.condition}
                            </span>
                            {unavailable ? (
                              <Badge tone="red">No longer available</Badge>
                            ) : null}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <form className="flex items-center gap-1">
                              <button
                                formAction={async () => {
                                  "use server";
                                  await updateCartItem(item.id, item.quantity - 1);
                                }}
                                className="tap h-7 w-7 rounded-md border border-surface-300 text-ink-700"
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <button
                                formAction={async () => {
                                  "use server";
                                  await updateCartItem(item.id, item.quantity + 1);
                                }}
                                className="tap h-7 w-7 rounded-md border border-surface-300 text-ink-700"
                              >
                                +
                              </button>
                            </form>
                            <p className="font-semibold text-ink-900">
                              {formatPrice(
                                Number(item.unit_price) * item.quantity,
                                p?.currency ?? "USD",
                              )}
                            </p>
                          </div>
                        </div>
                        <form>
                          <button
                            formAction={async () => {
                              "use server";
                              await removeCartItem(item.id);
                            }}
                            className="tap text-xs text-ink-400 underline hover:text-red-600"
                          >
                            Remove
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          <div className="fixed inset-x-0 bottom-14 z-30 border-t border-surface-200 bg-white p-4 sm:static sm:mt-6 sm:rounded-xl sm:border sm:p-4">
            <div className="mx-auto flex max-w-3xl items-center justify-between">
              <div>
                <p className="text-xs text-ink-500">Subtotal</p>
                <p className="text-lg font-bold text-ink-900">
                  {formatPrice(total)}
                </p>
              </div>
              <ButtonLink href="/checkout" size="lg" className="px-8">
                Checkout
              </ButtonLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
