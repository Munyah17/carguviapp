import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://carguviapp.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/vendor", "/enumerator", "/account", "/orders", "/checkout", "/cart", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
