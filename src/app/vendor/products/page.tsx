import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { formatPrice, timeAgo } from "@/lib/format";
import { FreshnessBadge } from "@/components/product/freshness-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { updateAvailability } from "../actions";
import { IconPlus } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

export default async function VendorProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, title, price, currency, condition, availability, quantity, status, seller_updated_at, seller_confirmed_at, carguvi_verified_at, product_images(url, sort_order)",
    )
    .eq("vendor_id", info.vendor.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">Products</h1>
        <ButtonLink href="/vendor/products/new" size="sm">
          <IconPlus className="h-4 w-4" /> Add product
        </ButtonLink>
      </div>

      <ul className="mt-4 space-y-3">
        {(products ?? []).map((p: any) => {
          const img = (p.product_images ?? []).sort(
            (a: any, b: any) => a.sort_order - b.sort_order,
          )[0];
          return (
            <li
              key={p.id}
              className="flex gap-3 rounded-xl border border-surface-200 bg-white p-3"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold text-ink-900">
                    {p.title}
                  </p>
                  <p className="shrink-0 font-semibold text-ink-900">
                    {formatPrice(p.price, p.currency)}
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <FreshnessBadge product={p} />
                  {p.quantity != null ? (
                    <span className="text-xs text-ink-500">
                      Qty {p.quantity}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Quick availability controls */}
                  <select
                    defaultValue={p.availability}
                    className="h-8 rounded-lg border border-surface-300 px-2 text-xs text-ink-700"
                    form={`avail-${p.id}`}
                    name="availability"
                  >
                    <option value="in_stock">In stock</option>
                    <option value="low_stock">Low stock</option>
                    <option value="out_of_stock">Out of stock</option>
                    <option value="available_on_order">On order</option>
                  </select>
                  <form
                    id={`avail-${p.id}`}
                    action={async (fd: FormData) => {
                      "use server";
                      await updateAvailability(
                        p.id,
                        String(fd.get("availability") ?? "unknown"),
                      );
                    }}
                  >
                    <button className="tap h-8 rounded-lg bg-brand-50 px-3 text-xs font-medium text-brand-700">
                      Update
                    </button>
                  </form>
                  <Link
                    href={`/vendor/products/${p.id}/edit`}
                    className="tap h-8 rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-ink-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/products/${p.id}`}
                    className="tap h-8 px-2 py-1.5 text-xs text-ink-400 hover:text-ink-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {!products?.length ? (
        <p className="mt-8 text-center text-sm text-ink-500">
          No products yet. Add your first listing.
        </p>
      ) : null}
    </div>
  );
}
