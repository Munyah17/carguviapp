import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { createReview } from "./actions";

export const metadata = { title: "Leave a review" };

export default async function NewReviewPage({
  searchParams,
}: PageProps<"/reviews/new">) {
  const { vo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendorOrder } = vo
    ? await supabase
        .from("vendor_orders")
        .select(
          "id, vendor_id, status, order_id, vendors(business_name), order_items(product_id, title), orders(customer_id)",
        )
        .eq("id", String(vo))
        .single()
    : { data: null };

  if (
    !vendorOrder ||
    (vendorOrder.orders as any)?.customer_id !== user.id ||
    vendorOrder.status !== "completed"
  ) {
    redirect("/orders");
  }

  // Already reviewed?
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("vendor_order_id", vendorOrder.id)
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Leave a review</h1>
      <p className="mt-1 text-sm text-ink-500">
        {(vendorOrder.vendors as any)?.business_name} Â·{" "}
        {(vendorOrder.order_items as any[])
          .map((i) => i.title)
          .join(", ")}
      </p>
      {existing ? (
        <p className="mt-6 rounded-xl border border-trust-100 bg-trust-50 p-4 text-sm text-trust-700">
          You&apos;ve already reviewed this order. Thanks!
        </p>
      ) : (
        <form action={createReview} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="vendor_order_id" value={vendorOrder.id} />
          <input type="hidden" name="vendor_id" value={vendorOrder.vendor_id} />
          <input
            type="hidden"
            name="product_id"
            value={(vendorOrder.order_items as any[])?.[0]?.product_id ?? ""}
          />
          <Field label="Product quality">
            <Select name="product_rating" required>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} â€” {["Poor", "Fair", "Good", "Very good", "Excellent"][r - 1]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Vendor service">
            <Select name="vendor_rating" required>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} â€” {["Poor", "Fair", "Good", "Very good", "Excellent"][r - 1]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Comment (optional)">
            <Textarea
              name="comment"
              rows={4}
              placeholder="Was the part as described? How was the vendor?"
            />
          </Field>
          <Button type="submit" size="lg">
            Submit review
          </Button>
        </form>
      )}
    </div>
  );
}
