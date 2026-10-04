"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import { IconCart } from "@/components/ui/icons";

export function ProductActions({
  productId,
  canBuy,
}: {
  productId: string;
  canBuy: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const handle = (then: "stay" | "checkout") => {
    startTransition(async () => {
      const res = await addToCart(productId);
      if (res?.error === "sign_in_required") {
        router.push(`/login?next=/products/${productId}`);
        return;
      }
      if (res?.error) return;
      if (then === "checkout") {
        router.push("/checkout");
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-2">
      <Button
        variant="outline"
        size="lg"
        className="flex-1"
        disabled={!canBuy || pending}
        onClick={() => handle("stay")}
      >
        <IconCart className="h-4 w-4" />
        {added ? "Added to cart" : "Add to cart"}
      </Button>
      <Button
        size="lg"
        className="flex-1"
        disabled={!canBuy || pending}
        onClick={() => handle("checkout")}
      >
        Buy now
      </Button>
    </div>
  );
}
