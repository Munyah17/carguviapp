import { daysSince, timeAgo } from "./format";

export type FreshnessState =
  | "carguvi_fresh"     // Carguvi physically confirmed recently
  | "seller_fresh"      // Vendor recently confirmed/updated
  | "needs_confirmation" // Stale
  | "unavailable";      // Out of stock / sold / not confirmed

export interface FreshnessInfo {
  state: FreshnessState;
  /** Customer-facing label, e.g. "Carguvi confirmed 2 days ago" */
  label: string;
  /** Secondary line, e.g. "Seller updated 6 hours ago" */
  detail: string;
}

const CARGUVI_FRESH_DAYS = 7;
const SELLER_FRESH_DAYS = 14;

const UNAVAILABLE = new Set(["out_of_stock", "sold", "unavailable"]);

export function getFreshness(product: {
  availability: string;
  seller_updated_at?: string | null;
  seller_confirmed_at?: string | null;
  carguvi_verified_at?: string | null;
}): FreshnessInfo {
  if (UNAVAILABLE.has(product.availability)) {
    return {
      state: "unavailable",
      label: product.availability === "sold" ? "Sold" : "Out of stock",
      detail: "",
    };
  }

  const carguviDays = daysSince(product.carguvi_verified_at);
  const sellerDays = daysSince(
    product.seller_confirmed_at ?? product.seller_updated_at,
  );

  if (carguviDays !== null && carguviDays <= CARGUVI_FRESH_DAYS) {
    return {
      state: "carguvi_fresh",
      label: `Carguvi confirmed ${carguviDays === 0 ? "today" : timeAgo(product.carguvi_verified_at)}`,
      detail:
        sellerDays !== null
          ? `Seller updated ${timeAgo(product.seller_updated_at)}`
          : "",
    };
  }

  if (sellerDays !== null && sellerDays <= SELLER_FRESH_DAYS) {
    return {
      state: "seller_fresh",
      label: `Seller confirmed ${sellerDays === 0 ? "today" : timeAgo(product.seller_confirmed_at ?? product.seller_updated_at)}`,
      detail: "Awaiting Carguvi check",
    };
  }

  return {
    state: "needs_confirmation",
    label: "Availability needs confirmation",
    detail: "",
  };
}

export function freshnessDot(state: FreshnessState): string {
  switch (state) {
    case "carguvi_fresh":
      return "bg-fresh-green";
    case "seller_fresh":
      return "bg-fresh-amber";
    case "needs_confirmation":
      return "bg-fresh-gray";
    case "unavailable":
      return "bg-red-500";
  }
}
