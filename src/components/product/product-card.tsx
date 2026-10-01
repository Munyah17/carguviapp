import Link from "next/link";
import type { ProductListItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { CardActions } from "./card-actions";
import { IconPin } from "@/components/ui/icons";

/**
 * Fixed-template commerce tile — every slot has a reserved height so cards in
 * a row are pixel-identical and the action buttons always align:
 *   image (4:3) → title (2 lines) → price → description (1 line) → buttons.
 * Trust/verification detail lives on the product page.
 */
export function ProductCard({
  product,
  grid = false,
}: {
  product: ProductListItem;
  /** @deprecated kept for call-site compatibility — all cards are tiles now. */
  grid?: boolean;
}) {
  const outOfStock = product.availability === "out_of_stock";
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-surface-200 bg-white transition-shadow hover:shadow-sm">
      <Link
        href={`/products/${product.id}`}
        className="tap relative block aspect-[4/3] w-full overflow-hidden bg-surface-100"
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
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-400">
            No image
          </div>
        )}
        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-ink-900/80 px-2.5 py-1 text-[11px] font-medium text-white">
              Out of stock
            </span>
          </div>
        ) : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-2.5">
        <Link
          href={`/products/${product.id}`}
          className="tap line-clamp-2 h-10 text-sm font-semibold leading-snug text-ink-900 hover:text-brand-800"
        >
          {product.title}
        </Link>
        <p className="mt-1 h-6 text-base font-semibold leading-6 text-ink-900">
          {formatPrice(product.price, product.currency)}
        </p>
        <p
          className={cn(
            "mt-1 h-8 line-clamp-2 text-xs leading-4",
            outOfStock ? "text-red-600" : "text-ink-500",
          )}
        >
          {outOfStock
            ? "Currently unavailable"
            : product.description || product.vendor?.business_name || ""}
        </p>
        <p className="mt-1 flex h-4 items-center gap-1 text-xs leading-4 text-ink-400">
          <IconPin className="h-3 w-3 shrink-0 text-brand-600" />
          <span className="truncate">
            {[
              product.vendor?.business_name,
              product.vendor?.operating_area,
              product.vendor?.city ?? "Zimbabwe",
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </p>
        <div className="mt-auto pt-2">
          <CardActions productId={product.id} disabled={outOfStock} />
        </div>
      </div>
    </div>
  );
}
