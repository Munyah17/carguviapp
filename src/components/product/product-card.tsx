import Link from "next/link";
import type { ProductListItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { CardActions } from "./card-actions";

/**
 * Clean commerce tile: ~60% image, title, price, one-line description,
 * Add to cart + Buy now. Trust/verification detail lives on the product page.
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
    <div className="flex flex-col overflow-hidden rounded-xl border border-surface-200 bg-white transition-shadow hover:shadow-sm">
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
          className="tap line-clamp-2 text-sm font-medium leading-snug text-ink-900 hover:text-brand-800"
        >
          {product.title}
        </Link>
        <p className="mt-0.5 text-base font-semibold text-ink-900">
          {formatPrice(product.price, product.currency)}
        </p>
        <p
          className={cn(
            "mt-0.5 line-clamp-1 text-xs",
            outOfStock ? "text-red-600" : "text-ink-500",
          )}
        >
          {outOfStock
            ? "Currently unavailable"
            : product.description || product.vendor?.business_name}
        </p>
        <CardActions productId={product.id} disabled={outOfStock} />
      </div>
    </div>
  );
}
