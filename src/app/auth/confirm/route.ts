import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email confirmation landing. Supabase emails link here with
 * ?token_hash=...&type=signup (or recovery/invite/email_change).
 * Verifies the token, establishes the session, then sends the user on.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/";

  const code = url.searchParams.get("code");
  const dest = next.startsWith("/") ? next : "/";

  // PKCE code-exchange variant (used when flow_type = pkce).
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(dest === "/" ? "/login?confirmed=1" : dest, url.origin));
    }
    return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "recovery" | "invite" | "email_change" | "magiclink",
    });
    if (!error) {
      const target =
        type === "recovery" ? "/account?reset=1" : dest === "/" ? "/login?confirmed=1" : dest;
      return NextResponse.redirect(new URL(target, url.origin));
    }
    return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
  }

  return NextResponse.redirect(new URL("/login", url.origin));
}
