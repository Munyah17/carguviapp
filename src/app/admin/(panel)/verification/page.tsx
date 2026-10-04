import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo, daysSince } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { assignVerificationTask } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verification" };

export default async function AdminVerificationPage() {
  const supabase = await createClient();

  const [{ data: tasks }, { data: enumerators }, { data: stale }, { data: vendors }] =
    await Promise.all([
      supabase
        .from("verification_tasks")
        .select(
          `id, status, task_type, due_date, created_at,
           profiles:enumerator_id(full_name),
           vendors(business_name),
           products(title)`,
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("user_roles")
        .select("user_id, profiles(full_name)")
        .eq("role", "enumerator"),
      supabase
        .from("products")
        .select(
          "id, title, price, availability, carguvi_verified_at, seller_confirmed_at, seller_updated_at, view_count, vendors(id, business_name)",
        )
        .eq("status", "active")
        .order("view_count", { ascending: false }),
      supabase
        .from("vendors")
        .select("id, business_name")
        .eq("status", "approved"),
    ]);

  const staleProducts = (stale ?? [])
    .filter((p: any) => {
      const d = daysSince(
        p.carguvi_verified_at ?? p.seller_confirmed_at ?? p.seller_updated_at,
      );
      return d === null || d > 14;
    })
    .slice(0, 20);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Verification operations</h1>

      {/* Assign task */}
      <form
        action={assignVerificationTask}
        className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-surface-200 bg-white p-4"
      >
        <h2 className="col-span-2 font-semibold text-ink-900">
          Assign verification task
        </h2>
        <Field label="Enumerator">
          <Select name="enumerator_id" required>
            <option value="">Choose…</option>
            {(enumerators ?? []).map((e: any) => (
              <option key={e.user_id} value={e.user_id}>
                {e.profiles?.full_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Vendor">
          <Select name="vendor_id" required>
            <option value="">Choose…</option>
            {(vendors ?? []).map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.business_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Task type">
          <Select name="task_type">
            <option value="product_availability">Product availability</option>
            <option value="shop_check">Shop check</option>
            <option value="price_check">Price check</option>
            <option value="photo_capture">Photo capture</option>
            <option value="follow_up">Follow-up</option>
            <option value="discrepancy_review">Discrepancy review</option>
          </Select>
        </Field>
        <Field label="Product ID (optional)">
          <Input name="product_id" placeholder="UUID" />
        </Field>
        <Field label="Due date">
          <Input name="due_date" type="date" />
        </Field>
        <Field label="Notes">
          <Input name="notes" />
        </Field>
        <div className="col-span-2">
          <Button type="submit">Assign task</Button>
        </div>
      </form>

      {/* Stale listings — verification pipeline */}
      <h2 className="mb-2 mt-8 text-sm font-semibold text-ink-900">
        Stale listings needing physical check
      </h2>
      <ul className="space-y-2">
        {staleProducts.map((p: any) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">
                {p.title}
              </p>
              <p className="text-xs text-ink-500">
                {p.vendors?.business_name} · {formatPrice(p.price)} ·{" "}
                {p.view_count} views · last confirmed{" "}
                {timeAgo(p.carguvi_verified_at ?? p.seller_confirmed_at) ||
                  "never"}
              </p>
            </div>
            <Badge tone="amber">{daysSince(p.carguvi_verified_at ?? p.seller_confirmed_at)}d stale</Badge>
          </li>
        ))}
        {!staleProducts.length ? (
          <p className="text-sm text-ink-500">No stale listings.</p>
        ) : null}
      </ul>

      {/* Recent tasks */}
      <h2 className="mb-2 mt-8 text-sm font-semibold text-ink-900">
        Recent tasks
      </h2>
      <ul className="space-y-2">
        {(tasks ?? []).map((t: any) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-ink-900">
                {t.products?.title ?? t.task_type.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-ink-500">
                {t.vendors?.business_name} · {t.profiles?.full_name} ·{" "}
                {timeAgo(t.created_at)}
              </p>
            </div>
            <Badge
              tone={
                t.status === "completed"
                  ? "green"
                  : t.status === "flagged"
                    ? "red"
                    : "amber"
              }
            >
              {t.status}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
