import { createClient as createJsClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

/**
 * Cookieless anon client for public, cacheable reads (categories, vehicle
 * taxonomy, hero slides, product lists). Must only be used for data that is
 * world-readable under RLS — it carries no user session.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return createJsClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
