import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guest sessions — return the current user, or create a guest one.
 * Preferred path is Supabase anonymous sign-in; when the project has it
 * disabled we fall back to provisioning a real guest account via the
 * service role and signing in with it. Either way the session lands in
 * cookies, so carts/orders/tracking all work with zero sign-in walls.
 * Call only inside server actions/route handlers/proxy (cookies writable).
 */
export async function ensureUser(supabase: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;
  return createGuestSession(supabase);
}

export async function createGuestSession(
  supabase: SupabaseClient,
): Promise<User | null> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (!error && data.user) return data.user;

  // Fallback for projects with anonymous sign-ins disabled:
  // provision a synthetic guest account via the service role, then sign in.
  try {
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const email = `guest-${id}@guest.carguvi.local`;
    const password = crypto.randomUUID();
    const admin = createAdminClient();
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { guest: true },
    });
    if (createErr) return null;
    const { data: signIn, error: signInErr } =
      await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) return null;
    return signIn.user;
  } catch {
    return null;
  }
}

/** True when the session belongs to a guest (anonymous or provisioned). */
export function isGuest(user: User | null | undefined): boolean {
  return (
    !!user &&
    (user.is_anonymous === true ||
      !user.email ||
      user.user_metadata?.guest === true ||
      user.email.endsWith("@guest.carguvi.local"))
  );
}
