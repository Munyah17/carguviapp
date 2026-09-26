import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries";
import { formatPrice, timeAgo } from "@/lib/format";
import { FreshnessBadge } from "@/components/product/freshness-badge";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "./product-actions";
import { createClient } from "@/lib/supabase/server";
import {
  IconPin,
  IconShield,
  IconStore,
  IconTruck,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  // Demand signal: record the view.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  supabase
    .from("product_views")
    .insert({ product_id: id, user_id: user?.id ?? null })
    .then(() => {});

  const vendor = product.vendors as any;
  const location = vendor?.vendor_locations?.find((l: any) => l.is_primary)
    ?? vendor?.vendor_locations?.[0];
  const images = ((product.product_images as any[]) ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const compat = (product.product_compatibility as any[]) ?? [];
  const canBuy = !["out_of_stock"].includes(product.availability);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 pb-24 sm:pb-10">
      <nav className="mb-3 text-sm text-ink-400">
        <Link href="/search" className="hover:text-ink-700">
          Search
        </Link>{" "}
        / <span className="text-ink-700">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-surface-200 bg-surface-100">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[0].url}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-400">
                No photos yet
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {images.map((img: any, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.url}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-surface-200 object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold leading-snug text-ink-900">
              {product.title}
            </h1>
            <p className="mt-1 text-2xl font-bold text-ink-900">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" className="capitalize">
              {product.condition}
            </Badge>
            <Badge
              tone={
                product.availability === "in_stock"
                  ? "green"
                  : product.availability === "out_of_stock"
                    ? "red"
                    : "amber"
              }
              className="capitalize"
            >
              {product.availability.replace(/_/g, " ")}
            </Badge>
            {product.quantity != null ? (
              <Badge tone="gray">Qty: {product.quantity}</Badge>
            ) : null}
          </div>

          <FreshnessBadge product={product} showDetail />

          {product.seller_updated_at ? (
            <p className="text-xs text-ink-400">
              Seller updated {timeAgo(product.seller_updated_at)}
            </p>
          ) : null}

          {/* Compatibility */}
          {compat.length > 0 ? (
            <div className="rounded-xl border border-surface-200 p-3">
              <h2 className="text-sm font-semibold text-ink-900">
                Compatibility
              </h2>
              <ul className="mt-1.5 space-y-1 text-sm text-ink-700">
                {compat.map((c: any) => (
                  <li key={c.id}>
                    {c.vehicle_makes?.name ?? "Universal"}{" "}
                    {c.vehicle_models?.name ?? ""}{" "}
                    {c.vehicle_generations?.name ?? ""}{" "}
                    {c.vehicle_engines?.name ?? ""}
                    {c.year_start || c.year_end
                      ? ` (${c.year_start ?? "?"}–${c.year_end ?? "?"})`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
              {product.description}
            </p>
          ) : null}

          {product.part_number || product.oem_number ? (
            <dl className="grid grid-cols-2 gap-2 rounded-xl bg-surface-50 p-3 text-sm">
              {product.part_number ? (
                <>
                  <dt className="text-ink-500">Part number</dt>
                  <dd className="font-medium text-ink-900">
                    {product.part_number}
                  </dd>
                </>
              ) : null}
              {product.oem_number ? (
                <>
                  <dt className="text-ink-500">OEM number</dt>
                  <dd className="font-medium text-ink-900">
                    {product.oem_number}
                  </dd>
                </>
              ) : null}
            </dl>
          ) : null}

          {/* Vendor card */}
          <Link
            href={`/vendors/${vendor.slug}`}
            className="tap flex items-center gap-3 rounded-xl border border-surface-200 p-3 hover:border-brand-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <IconStore className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                {vendor.business_name}
                {vendor.is_verified ? (
                  <IconShield className="h-4 w-4 text-brand-600" />
                ) : null}
              </p>
              {location ? (
                <p className="flex items-center gap-1 text-xs text-ink-500">
                  <IconPin className="h-3 w-3" />
                  {location.area ? `${location.area}, ` : ""}
                  {location.city}
                </p>
              ) : null}
            </div>
            <span className="text-sm font-medium text-brand-700">
              View shop
            </span>
          </Link>

          {/* Fulfilment */}
          <div className="flex gap-3 text-sm">
            {product.pickup_available ? (
              <span className="flex items-center gap-1.5 text-ink-700">
                <IconStore className="h-4 w-4 text-ink-400" /> Pickup available
              </span>
            ) : null}
            {product.delivery_available ? (
              <span className="flex items-center gap-1.5 text-ink-700">
                <IconTruck className="h-4 w-4 text-ink-400" /> Carguvi Delivery
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-surface-200 bg-white p-3 sm:static sm:mt-8 sm:border-0 sm:p-0">
        <ProductActions productId={product.id} canBuy={canBuy} />
      </div>
    </div>
  );
}
