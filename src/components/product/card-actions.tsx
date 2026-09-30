"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";

export function CardActions({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);

  const buy = (thenCheckout: boolean) =>
    start(async () => {
      const res = await addToCart(productId, 1);
      if (res.error === "sign_in_required") {
        router.push(
          `/login?next=${thenCheckout ? "/checkout" : `/products/${productId}`}`,
        );
        return;
      }
      if (res.error) return;
      if (thenCheckout) router.push("/checkout");
      else {
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }
    });

  return (
    <div className="mt-1.5 flex gap-1.5">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => buy(false)}
        className="tap flex-1 rounded-lg border border-brand-200 bg-brand-50 py-1.5 text-xs font-semibold text-brand-800 disabled:opacity-50"
      >
        {added ? "Added âœ“" : "Add to cart"}
      </button>
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => buy(true)}
        className="tap flex-1 rounded-lg bg-brand-700 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        Buy now
      </button>
    </div>
  );
}
