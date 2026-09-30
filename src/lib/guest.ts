import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * Guest sessions — return the current user, or create an anonymous one.
 * Anonymous users get a profile + customer role + cart via the
 * handle_new_user trigger, so carts/orders/tracking all work normally.
 * Call only inside server actions/route handlers (cookies must be writable).
 */
export async function ensureUser(supabase: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) return null;
  return data.user;
}

/** True when the session belongs to a guest (anonymous) user. */
export function isGuest(user: User | null | undefined): boolean {
  return !!user && (user.is_anonymous === true || !user.email);
}
