// Application-level domain types for joined query results.

export type Role =
  | "super_admin"
  | "admin"
  | "vendor"
  | "staff"
  | "enumerator"
  | "customer";

export interface VendorSummary {
  id: string;
  business_name: string;
  slug: string;
  is_verified: boolean;
  rating: number | null;
  review_count: number;
  operating_area: string | null;
  city: string;
}

export interface ProductListItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: "new" | "used" | "refurbished";
  availability: string;
  quantity: number | null;
  seller_updated_at: string | null;
  seller_confirmed_at: string | null;
  carguvi_verified_at: string | null;
  pickup_available: boolean;
  delivery_available: boolean;
  image_url: string | null;
  description: string | null;
  vendor: VendorSummary | null;
  distance_km?: number | null;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

export interface VehicleOption {
  make_id: number;
  make_name: string;
  model_id: number;
  model_name: string;
  generation_id: number | null;
  generation_name: string | null;
  engine_id: number | null;
  engine_name: string | null;
}
