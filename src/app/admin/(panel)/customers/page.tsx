import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("user_id, profiles(full_name, email, phone, created_at)")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Customers</h1>
      <ul className="mt-4 divide-y divide-surface-100 rounded-xl border border-surface-200 bg-white">
        {(data ?? []).map((r: any) => (
          <li key={r.user_id} className="px-4 py-3">
            <p className="text-sm font-medium text-ink-900">
              {r.profiles?.full_name ?? "—"}
            </p>
            <p className="text-xs text-ink-500">
              {r.profiles?.email}
              {r.profiles?.phone ? ` · ${r.profiles.phone}` : ""} · joined{" "}
              {timeAgo(r.profiles?.created_at)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
