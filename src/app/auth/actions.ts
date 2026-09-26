"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/queries";
import { redirect } from "next/navigation";

export interface AuthFormState {
  error?: string;
}

function homeForRoles(roles: string[]): string {
  if (roles.includes("super_admin") || roles.includes("admin")) return "/admin";
  if (roles.includes("enumerator")) return "/enumerator";
  if (roles.includes("vendor") || roles.includes("staff")) return "/vendor";
  return "/";
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: "Incorrect email or password." };

  const roles = await getUserRoles(data.user.id);
  redirect(next && next.startsWith("/") ? next : homeForRoles(roles));
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Fill in your name, email and password." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone, role: "customer" } },
  });
  if (error) return { error: error.message };
  if (!data.user) return { error: "Could not create account." };

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
