import type { MetadataRoute } from "next";
import { isSupabaseConfigured } from "@/lib/env";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://carguviapp.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/categories",
    "/garage",
    "/login",
    "/auth/register",
    "/vendor/apply",
  ].map((path) => ({ url: `${BASE}${path}`, changeFrequency: "daily" }));

  if (!isSupabaseConfigured()) return staticRoutes;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const [{ data: products }, { data: vendors }] = await Promise.all([
    admin
      .from("products")
      .select("id, updated_at")
      .eq("status", "active")
      .limit(2000),
    admin.from("vendors").select("slug, updated_at").eq("status", "approved"),
  ]);

  return [
    ...staticRoutes,
    ...(products ?? []).map((p) => ({
      url: `${BASE}/products/${p.id}`,
      lastModified: p.updated_at ?? undefined,
      changeFrequency: "daily" as const,
    })),
    ...(vendors ?? []).map((v) => ({
      url: `${BASE}/vendors/${v.slug}`,
      lastModified: v.updated_at ?? undefined,
      changeFrequency: "daily" as const,
    })),
  ];
}
