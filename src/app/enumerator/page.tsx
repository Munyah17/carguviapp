import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconPin } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verification tasks" };

export default async function EnumeratorDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/enumerator");
  const roles = await getUserRoles(user.id);
  if (!roles.includes("enumerator") && !roles.includes("admin") && !roles.includes("super_admin")) {
    redirect("/");
  }

  const { data: tasks } = await supabase
    .from("verification_tasks")
    .select(
      `id, task_type, status, due_date, notes,
       vendors(id, business_name, vendor_locations(address, area)),
       products(id, title, price, availability)`,
    )
    .eq("enumerator_id", user.id)
    .order("due_date", { ascending: true });

  const assigned = (tasks ?? []).filter((t: any) =>
    ["assigned", "started"].includes(t.status),
  );
  const done = (tasks ?? []).filter((t: any) =>
    ["completed", "skipped", "flagged"].includes(t.status),
  );

  const byVendor = new Map<string, any[]>();
  for (const t of assigned) {
    const key = t.vendors?.id ?? "x";
    if (!byVendor.has(key)) byVendor.set(key, []);
    byVendor.get(key)!.push(t);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Today&apos;s assignments</h1>
      <p className="mt-1 text-sm text-ink-500">
        {byVendor.size} shops · {assigned.length} tasks ·{" "}
        {done.length} completed
      </p>

      {[...byVendor.entries()].map(([vendorId, vTasks]) => {
        const v = vTasks[0].vendors;
        const loc = v?.vendor_locations?.[0];
        return (
          <section
            key={vendorId}
            className="mt-4 rounded-xl border border-surface-200 bg-white"
          >
            <div className="border-b border-surface-200 px-4 py-3">
              <h2 className="font-semibold text-ink-900">{v?.business_name}</h2>
              {loc ? (
                <p className="flex items-center gap-1 text-xs text-ink-500">
                  <IconPin className="h-3 w-3" />
                  {loc.address}
                  {loc.area ? `, ${loc.area}` : ""}
                </p>
              ) : null}
            </div>
            <ul className="divide-y divide-surface-100">
              {vTasks.map((t: any) => (
                <li key={t.id}>
                  <Link
                    href={`/enumerator/tasks/${t.id}`}
                    className="tap flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {t.products?.title ??
                          (t.task_type === "shop_check"
                            ? "Verify shop"
                            : "Verification task")}
                      </p>
                      <p className="text-xs capitalize text-ink-400">
                        {t.task_type.replace(/_/g, " ")}
                        {t.due_date ? ` · due ${t.due_date}` : ""}
                      </p>
                    </div>
                    <Badge tone={t.status === "started" ? "blue" : "amber"}>
                      {t.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {!assigned.length ? (
        <div className="mt-8 rounded-xl border border-trust-100 bg-trust-50 p-8 text-center">
          <IconCheck className="mx-auto h-8 w-8 text-trust-600" />
          <p className="mt-2 font-medium text-trust-700">
            No open assignments
          </p>
        </div>
      ) : null}
    </div>
  );
}
