import Link from "next/link";
import type { ProductListItem } from "@/lib/types";
import { formatDistance, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { FreshnessBadge } from "./freshness-badge";
import { IconPin, IconShield } from "@/components/ui/icons";

const conditionLabel = {
  new: "New",
  used: "Used",
  refurbished: "Refurbished",
} as const;

const availabilityLabel: Record<string, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  available_on_order: "On order",
  unknown: "Check availability",
};

export function ProductCard({
  product,
  grid = false,
}: {
  product: ProductListItem;
  /** Render as a vertical grid tile even on mobile (for multi-col grids). */
  grid?: boolean;
}) {
  const outOfStock = ["out_of_stock"].includes(product.availability);
  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "tap flex rounded-xl border border-surface-200 bg-white transition-shadow hover:shadow-sm",
        grid
          ? "flex-col overflow-hidden"
          : "gap-3 p-3 sm:flex-col sm:gap-0 sm:p-0 sm:overflow-hidden",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-surface-100",
          grid
            ? "h-28 w-full sm:h-40"
            : "h-24 w-24 rounded-lg sm:h-40 sm:w-full sm:rounded-none",
        )}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400 text-xs">
            No image
          </div>
        )}
        {outOfStock ? (
          <div className="absolute inset-0 bg-white/70" />
        ) : null}
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1",
          grid ? "p-2.5" : "sm:p-3",
        )}
      >
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-900">
          {product.title}
        </h3>
        <p className="text-base font-semibold text-ink-900">
          {formatPrice(product.price, product.currency)}
        </p>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>{conditionLabel[product.condition]}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              outOfStock ? "text-red-600" : "text-trust-600",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                outOfStock ? "bg-red-500" : "bg-trust-500",
              )}
            />
            {availabilityLabel[product.availability] ?? product.availability}
          </span>
        </div>
        <FreshnessBadge product={product} />
        <div className="mt-auto flex items-center gap-1 truncate pt-1 text-xs text-ink-500">
          {product.vendor?.is_verified ? (
            <IconShield className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          ) : null}
          <span className="truncate">{product.vendor?.business_name}</span>
          {product.distance_km != null ? (
            <span className="flex items-center gap-0.5 text-ink-400">
              · <IconPin className="h-3 w-3" />
              {formatDistance(product.distance_km)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
