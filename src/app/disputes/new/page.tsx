import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { createDispute } from "./actions";

export const metadata = { title: "Report a problem" };

const TYPES: [string, string][] = [
  ["wrong_product", "Wrong product"],
  ["unavailable_product", "Product was unavailable"],
  ["damaged_product", "Product was damaged"],
  ["incorrect_description", "Incorrect description"],
  ["incorrect_price", "Incorrect price"],
  ["delivery_problem", "Delivery problem"],
  ["other", "Other"],
];

export default async function NewDisputePage({
  searchParams,
}: PageProps<"/disputes/new">) {
  const { order } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: o } = order
    ? await supabase
        .from("orders")
        .select("id, vendor_orders(id, vendor_id, vendors(business_name))")
        .eq("id", String(order))
        .single()
    : { data: null };
  if (order && (!o || o.id !== order)) redirect("/orders");
  const vendorOrder = o?.vendor_orders?.[0];

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Report a problem</h1>
      <p className="mt-1 text-sm text-ink-500">
        Carguvi support will review and follow up.
      </p>
      <form action={createDispute} className="mt-5 flex flex-col gap-4">
        <input type="hidden" name="order_id" value={o?.id ?? ""} />
        <input type="hidden" name="vendor_order_id" value={vendorOrder?.id ?? ""} />
        <input type="hidden" name="vendor_id" value={vendorOrder?.vendor_id ?? ""} />
        {vendorOrder ? (
          <p className="rounded-lg bg-surface-50 px-3 py-2 text-sm text-ink-700">
            Order with <strong>{vendorOrder.vendors?.business_name}</strong>
          </p>
        ) : null}
        <Field label="What went wrong?">
          <Select name="dispute_type" required>
            {TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Describe the issue">
          <Textarea name="description" required rows={4} />
        </Field>
        <Button type="submit" size="lg">
          Submit report
        </Button>
      </form>
    </div>
  );
}
