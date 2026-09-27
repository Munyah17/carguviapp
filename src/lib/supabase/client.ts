import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { isSupabaseConfigured, SupabaseNotConfiguredError } from "@/lib/env";

export function createClient() {
  if (!isSupabaseConfigured()) throw new SupabaseNotConfiguredError();
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
