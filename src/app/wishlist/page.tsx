import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toListItem } from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";
import { IconHeart } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/wishlist");

  const { data } = await supabase
    .from("product_favourites")
    .select(
      `products(id, title, price, currency, condition, availability, quantity,
                seller_updated_at, seller_confirmed_at, carguvi_verified_at,
                pickup_available, delivery_available,
                product_images(url, sort_order),
                vendors!inner(id, business_name, slug, is_verified, rating, review_count, operating_area, city))`,
    )
    .eq("user_id", user.id);

  const products = (data ?? [])
    .map((r: any) => r.products)
    .filter(Boolean)
    .map(toListItem);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Wishlist</h1>
      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center">
          <IconHeart className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 font-medium text-ink-700">Nothing saved yet</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
