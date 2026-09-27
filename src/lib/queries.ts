import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { unstable_cache } from "next/cache";
import type { ProductListItem } from "./types";

const PRODUCT_LIST_SELECT = `
  id, title, price, currency, condition, availability, quantity,
  seller_updated_at, seller_confirmed_at, carguvi_verified_at,
  pickup_available, delivery_available,
  product_images(url, sort_order),
  vendors!inner(id, business_name, slug, is_verified, rating, review_count, operating_area, city)
`;

export function toListItem(row: any): ProductListItem {
  const imgs = (row.product_images ?? []) as { url: string; sort_order: number }[];
  imgs.sort((a, b) => a.sort_order - b.sort_order);
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    currency: row.currency,
    condition: row.condition,
    availability: row.availability,
    quantity: row.quantity,
    seller_updated_at: row.seller_updated_at,
    seller_confirmed_at: row.seller_confirmed_at,
    carguvi_verified_at: row.carguvi_verified_at,
    pickup_available: row.pickup_available,
    delivery_available: row.delivery_available,
    image_url: imgs[0]?.url ?? null,
    vendor: row.vendors ?? null,
  };
}

export interface SearchParams {
  q?: string;
  categoryId?: number;
  makeId?: number;
  modelId?: number;
  generationId?: number;
  engineId?: number;
  condition?: string;
  availability?: string;
  verifiedOnly?: boolean;
  maxPrice?: number;
  minPrice?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "freshest";
  limit?: number;
}

export async function searchProducts(p: SearchParams): Promise<ProductListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("status", "active");

  if (p.q && p.q.trim()) {
    // Full-text search; also match via ILIKE for partial words like "demio".
    const term = p.q.trim();
    query = query.or(
      `search_text.fts.${tsQuery(term)},title.ilike.%${escapeLike(term)}%,part_number.ilike.%${escapeLike(term)}%`,
    );
  }
  if (p.categoryId) {
    // Include subcategories: match the category itself or children.
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", p.categoryId);
    const ids = [p.categoryId, ...(children ?? []).map((c: any) => c.id)];
    query = query.in("category_id", ids);
  }
  if (p.condition) query = query.eq("condition", p.condition as any);
  if (p.availability) query = query.eq("availability", p.availability as any);
  if (p.verifiedOnly) {
    query = query.not("carguvi_verified_at", "is", null);
  }
  if (p.minPrice != null) query = query.gte("price", p.minPrice);
  if (p.maxPrice != null) query = query.lte("price", p.maxPrice);

  // Vehicle compatibility filter: product must have a matching fitment row,
  // or no fitment rows at all (universal products).
  const vehicleFilter =
    p.makeId || p.modelId || p.generationId || p.engineId;
  if (vehicleFilter) {
    let compatQuery = supabase
      .from("product_compatibility")
      .select("product_id");
    if (p.engineId) {
      compatQuery = compatQuery.or(
        `engine_id.eq.${p.engineId},engine_id.is.null`,
      );
    }
    if (p.generationId) {
      compatQuery = compatQuery.or(
        `generation_id.eq.${p.generationId},generation_id.is.null`,
      );
    }
    if (p.modelId) {
      compatQuery = compatQuery.or(
        `model_id.eq.${p.modelId},model_id.is.null`,
      );
    }
    if (p.makeId) {
      compatQuery = compatQuery.or(
        `make_id.eq.${p.makeId},make_id.is.null`,
      );
    }
    const { data: compatRows } = await compatQuery;
    const ids = [...new Set((compatRows ?? []).map((r: any) => r.product_id))];
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }

  switch (p.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "freshest":
      query = query.order("carguvi_verified_at", {
        ascending: false,
        nullsFirst: false,
      });
      break;
    default:
      query = query.order("carguvi_verified_at", {
        ascending: false,
        nullsFirst: false,
      });
  }

  const { data, error } = await query.limit(p.limit ?? 50);
  if (error) throw error;
  return (data ?? []).map(toListItem);
}

function tsQuery(term: string): string {
  return term
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join(" & ");
}

function escapeLike(term: string): string {
  return term.replace(/[%_]/g, "");
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*,
       product_images(url, sort_order),
       product_compatibility(*,
         vehicle_makes(name), vehicle_models(name),
         vehicle_generations(name, year_start, year_end),
         vehicle_engines(name, fuel_type)),
       vendors(*, vendor_locations(*))`,
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getVendorBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("*, vendor_locations(*), vendor_metrics(*)")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getVendorProducts(vendorId: string): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("vendor_id", vendorId)
    .eq("status", "active")
    .order("carguvi_verified_at", { ascending: false, nullsFirst: false });
  return (data ?? []).map(toListItem);
}

// Lookup tables are public and rarely change — cache them across requests
// so catalog pages don't hit the DB every render.
export const getCategories = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("categories")
      .select("*")
      .is("parent_id", null)
      .order("sort_order");
    return data ?? [];
  },
  ["categories"],
  { revalidate: 300, tags: ["categories"] },
);

export const getVehicleMakes = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("vehicle_makes")
      .select("*")
      .order("name");
    return data ?? [];
  },
  ["vehicle-makes"],
  { revalidate: 3600, tags: ["vehicle-taxonomy"] },
);

export const getVehicleModels = unstable_cache(
  async (makeId?: number) => {
    let q = createPublicClient().from("vehicle_models").select("*").order("name");
    if (makeId) q = q.eq("make_id", makeId);
    const { data } = await q;
    return data ?? [];
  },
  ["vehicle-models"],
  { revalidate: 3600, tags: ["vehicle-taxonomy"] },
);

export const getVehicleGenerations = unstable_cache(
  async (modelId?: number) => {
    let q = createPublicClient()
      .from("vehicle_generations")
      .select("*")
      .order("year_start", { nullsFirst: false });
    if (modelId) q = q.eq("model_id", modelId);
    const { data } = await q;
    return data ?? [];
  },
  ["vehicle-generations"],
  { revalidate: 3600, tags: ["vehicle-taxonomy"] },
);

export const getVehicleEngines = unstable_cache(
  async (generationId?: number) => {
    let q = createPublicClient().from("vehicle_engines").select("*").order("name");
    if (generationId) q = q.eq("generation_id", generationId);
    const { data } = await q;
    return data ?? [];
  },
  ["vehicle-engines"],
  { revalidate: 3600, tags: ["vehicle-taxonomy"] },
);

// ---------------------------------------------------------------------------
// Auth / roles
// ---------------------------------------------------------------------------

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}

/** Vendor the current user owns or works for (first match). */
export async function getVendorForUser(userId: string) {
  const supabase = await createClient();
  const { data: owned } = await supabase
    .from("vendors")
    .select("*")
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (owned) return { vendor: owned, staffRole: "owner" as string };
  const { data: staff } = await supabase
    .from("vendor_staff")
    .select("staff_role, permissions, vendors(*)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (staff) {
    return { vendor: (staff as any).vendors, staffRole: (staff as any).staff_role };
  }
  return null;
}

export async function getCustomerVehicles(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customer_vehicles")
    .select(
      `*, vehicle_makes(name), vehicle_models(name),
       vehicle_generations(name, year_start, year_end),
       vehicle_engines(name, fuel_type)`,
    )
    .eq("user_id", userId)
    .order("is_primary", { ascending: false });
  return data ?? [];
}

export const getHeroSlides = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  },
  ["hero-slides"],
  { revalidate: 300, tags: ["hero-slides"] },
);

/** "Verified near you" — recently Carguvi-confirmed products. */
export async function getVerifiedProducts(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("status", "active")
    .not("carguvi_verified_at", "is", null)
    .order("carguvi_verified_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(toListItem);
}

export async function getPopularSearches(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("search_events")
    .select("query")
    .order("created_at", { ascending: false })
    .limit(200);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const q = (row as any).query.toLowerCase().trim();
    counts.set(q, (counts.get(q) ?? 0) + 1);
  }
  const popular = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([q]) => q);
  return popular.slice(0, 6);
}
