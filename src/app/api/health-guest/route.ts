import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/** Temporary diagnostics — reports booleans and error strings only, no secrets. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const report: Record<string, unknown> = {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anon),
    urlHost: url ? new URL(url).host : null,
  };

  if (url && anon) {
    try {
      const jar = await cookies();
      const supabase = createServerClient(url, anon, {
        cookies: {
          getAll: () => jar.getAll(),
          setAll: () => {},
        },
      });
      const { data, error } = await supabase.auth.signInAnonymously();
      report.anonSignIn = error ? { ok: false, error: error.message, status: error.status } : { ok: true, userId: data.user?.id };
    } catch (e) {
      report.anonSignIn = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json(report);
}
