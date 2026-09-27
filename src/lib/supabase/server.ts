import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { isSupabaseConfigured, SupabaseNotConfiguredError } from "@/lib/env";

export async function createClient() {
  // cookies() marks the route dynamic — must run before the config check so
  // builds don't try to prerender DB-backed pages.
  const cookieStore = await cookies();
  if (!isSupabaseConfigured()) throw new SupabaseNotConfiguredError();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — session refresh is handled by proxy.ts.
          }
        },
      },
    },
  );
}
