import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addStaffMember, setStaffActive } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff" };

const STAFF_ROLES = [
  ["shop_manager", "Shop Manager"],
  ["cashier", "Cashier"],
  ["shop_assistant", "Shop Assistant"],
] as const;

export default async function VendorStaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");

  const { data: staff } = await supabase
    .from("vendor_staff")
    .select("id, staff_role, permissions, is_active, profiles(full_name, email)")
    .eq("vendor_id", info.vendor.id);

  const isOwner = info.staffRole === "owner";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Staff</h1>
      <p className="mt-1 text-sm text-ink-500">
        Employees with vendor-scoped permissions.
      </p>

      <ul className="mt-4 space-y-3">
        {(staff ?? []).map((s: any) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-ink-900">
                {s.profiles?.full_name ?? s.profiles?.email}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge tone="blue" className="capitalize">
                  {s.staff_role}
                </Badge>
                {Object.entries(s.permissions ?? {})
                  .filter(([, v]) => v === true)
                  .map(([k]) => (
                    <Badge key={k} tone="gray">
                      {k.replace(/_/g, " ")}
                    </Badge>
                  ))}
                {!s.is_active ? <Badge tone="red">inactive</Badge> : null}
              </div>
            </div>
            {isOwner && s.staff_role !== "owner" ? (
              <form
                action={async () => {
                  "use server";
                  await setStaffActive(s.id, !s.is_active);
                }}
              >
                <button className="tap rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-ink-700">
                  {s.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </form>
            ) : null}
          </li>
        ))}
        {!staff?.length ? (
          <p className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-6 text-center text-sm text-ink-500">
            No staff yet.
          </p>
        ) : null}
      </ul>

      {isOwner ? (
        <form
          action={addStaffMember}
          className="mt-6 flex flex-col gap-4 rounded-xl border border-surface-200 bg-white p-4"
        >
          <h2 className="font-semibold text-ink-900">Add employee</h2>
          <p className="text-xs text-ink-500">
            Creates a login for your employee — share the email and password with
            them. If they already have a Carguvi account, it gets linked instead.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <Input name="full_name" placeholder="e.g. Rudo Chikore" />
            </Field>
            <Field label="Phone">
              <Input name="phone" type="tel" placeholder="0772 000 000" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Email (login)">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Password (login)">
              <Input
                name="password"
                type="text"
                required
                minLength={6}
                placeholder="Set a password for them"
              />
            </Field>
          </div>
          <Field label="Role">
            <Select name="staff_role">
              {STAFF_ROLES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex flex-wrap gap-4 text-sm text-ink-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="perm_products" className="h-4 w-4" />
              Manage products
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="perm_orders" className="h-4 w-4" />
              Manage orders
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="perm_confirm" className="h-4 w-4" />
              Confirm listings
            </label>
          </div>
          <Button type="submit">Add staff member</Button>
        </form>
      ) : null}
    </div>
  );
}
