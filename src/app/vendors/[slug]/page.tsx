import { notFound } from "next/navigation";
import Link from "next/link";
import { getVendorBySlug, getVendorProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import {
  IconPin,
  IconShield,
  IconStar,
  IconStore,
  IconTruck,
  IconClock,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function VendorPage({
  params,
}: PageProps<"/vendors/[slug]">) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) notFound();

  const products = await getVendorProducts(vendor.id);
  const location = vendor.vendor_locations?.find((l: any) => l.is_primary)
    ?? vendor.vendor_locations?.[0];
  const metrics = Array.isArray(vendor.vendor_metrics)
    ? vendor.vendor_metrics[0]
    : vendor.vendor_metrics;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-10">
      {/* Storefront header */}
      <div className="rounded-xl border border-surface-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
            <IconStore className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-ink-900">
              {vendor.business_name}
              {vendor.is_verified ? (
                <Badge tone="blue">
                  <IconShield className="h-3.5 w-3.5" /> Carguvi Verified
                </Badge>
              ) : null}
            </h1>
            {location ? (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
                <IconPin className="h-4 w-4" />
                {location.address}
                {location.area ? `, ${location.area}` : ""}, {location.city}
              </p>
            ) : null}
            {vendor.description ? (
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {vendor.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Reliability strip */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-surface-200 pt-4 text-sm">
          {vendor.rating ? (
            <span className="flex items-center gap-1.5 text-ink-700">
              <IconStar className="h-4 w-4 fill-amber-400 text-amber-400" />
              <strong>{Number(vendor.rating).toFixed(1)}</strong>
              <span className="text-ink-400">
                ({vendor.review_count} reviews)
              </span>
            </span>
          ) : null}
          {metrics?.stock_accuracy ? (
            <span className="text-ink-700">
              <strong>{Math.round(metrics.stock_accuracy)}%</strong>{" "}
              <span className="text-ink-400">stock accuracy</span>
            </span>
          ) : null}
          {metrics?.fulfilment_rate ? (
            <span className="text-ink-700">
              <strong>{Math.round(metrics.fulfilment_rate)}%</strong>{" "}
              <span className="text-ink-400">order fulfilment</span>
            </span>
          ) : null}
          {location?.pickup_available ? (
            <span className="flex items-center gap-1.5 text-ink-700">
              <IconClock className="h-4 w-4 text-ink-400" /> Pickup available
            </span>
          ) : null}
          {location?.delivery_available ? (
            <span className="flex items-center gap-1.5 text-ink-700">
              <IconTruck className="h-4 w-4 text-ink-400" /> Carguvi Delivery
            </span>
          ) : null}
        </div>
      </div>

      {/* Products */}
      <h2 className="mb-3 mt-8 text-base font-semibold text-ink-900">
        Parts from {vendor.business_name}
        <span className="ml-2 text-sm font-normal text-ink-400">
          {products.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={`/inquiries/new?vendor=${vendor.id}`}
          className="tap text-sm font-medium text-brand-700 hover:underline"
        >
          Can&apos;t find what you need? Ask this vendor →
        </Link>
      </div>
    </div>
  );
}
