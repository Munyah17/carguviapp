import { cn } from "@/lib/cn";
import { freshnessDot, getFreshness } from "@/lib/freshness";
import { Badge } from "@/components/ui/badge";

const toneMap = {
  carguvi_fresh: "green",
  seller_fresh: "amber",
  needs_confirmation: "gray",
  unavailable: "red",
} as const;

/** Customer-facing freshness: shows "Carguvi confirmed", never internals. */
export function FreshnessBadge({
  product,
  showDetail = false,
}: {
  product: {
    availability: string;
    seller_updated_at?: string | null;
    seller_confirmed_at?: string | null;
    carguvi_verified_at?: string | null;
  };
  showDetail?: boolean;
}) {
  const f = getFreshness(product);
  return (
    <div className="flex flex-col gap-0.5">
      <Badge tone={toneMap[f.state]}>
        <span
          className={cn("h-1.5 w-1.5 rounded-full", freshnessDot(f.state))}
        />
        {f.label}
      </Badge>
      {showDetail && f.detail ? (
        <span className="text-xs text-ink-400">{f.detail}</span>
      ) : null}
    </div>
  );
}
