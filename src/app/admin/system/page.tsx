import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/queries";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { grantRole } from "../actions";
import { VehicleImportForm } from "./import-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "System" };

export default async function AdminSystemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const roles = user ? await getUserRoles(user.id) : [];
  if (!roles.includes("super_admin")) redirect("/admin");

  const [{ data: audit }, { data: settings }, { data: staffRoles }] =
    await Promise.all([
      supabase
        .from("audit_logs")
        .select("*, profiles:actor_id(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("platform_settings").select("*"),
      supabase
        .from("user_roles")
        .select("user_id, role, profiles(full_name, email)")
        .in("role", ["admin", "super_admin", "enumerator"]),
    ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">System</h1>

      <section className="mt-4 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Team & roles</h2>
        <ul className="mt-2 space-y-1">
          {(staffRoles ?? []).map((r: any) => (
            <li
              key={`${r.user_id}-${r.role}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-ink-700">
                {r.profiles?.full_name ?? r.profiles?.email}
              </span>
              <Badge tone="blue">{r.role}</Badge>
            </li>
          ))}
        </ul>
        <form action={grantRole} className="mt-4 flex flex-wrap items-end gap-2">
          <Field label="Email">
            <Input name="email" type="email" required className="w-56" />
          </Field>
          <Field label="Role">
            <Select name="role" className="w-40">
              <option value="admin">Admin</option>
              <option value="enumerator">Enumerator</option>
              <option value="super_admin">Super admin</option>
            </Select>
          </Field>
          <Button type="submit" size="md">
            Grant
          </Button>
        </form>
      </section>

      <section className="mt-4 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Vehicle catalogue import</h2>
        <p className="mt-1 text-sm text-ink-500">
          Bulk-load makes, models, generations and engines from a CSV or Excel
          file. Re-running the same file is safe — existing rows are matched by
          name.
        </p>
        <p className="mt-2 rounded-lg bg-surface-50 px-3 py-2 font-mono text-xs text-ink-600">
          Columns: make, model, generation, year_start, year_end, engine,
          fuel_type, transmission
        </p>
        <VehicleImportForm />
      </section>

      <section className="mt-4 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Platform settings</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-50 p-3 text-xs text-ink-700">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </section>

      <section className="mt-4 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Audit log</h2>
        <ul className="mt-2 divide-y divide-surface-100">
          {(audit ?? []).map((a: any) => (
            <li key={a.id} className="py-2 text-sm">
              <span className="font-medium text-ink-900">{a.action}</span>
              <span className="text-ink-500">
                {" "}
                on {a.entity_type} · by{" "}
                {a.profiles?.full_name ?? a.profiles?.email ?? "system"} ·{" "}
                {timeAgo(a.created_at)}
              </span>
            </li>
          ))}
          {!audit?.length ? (
            <li className="py-4 text-sm text-ink-500">No audit entries yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
