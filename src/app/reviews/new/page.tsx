import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { createReview } from "./actions";

export const metadata = { title: "Leave a review" };

export default async function NewReviewPage({
  searchParams,
}: PageProps<"/reviews/new">) {
  const { order } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: o } = order
    ? await supabase
        .from("orders")
        .select(
          "id, status, customer_id, vendor_orders(id, vendor_id, vendors(business_name), order_items(product_id, title))",
        )
        .eq("id", String(order))
        .single()
    : { data: null };

  const vendorOrder = o?.vendor_orders?.[0];
  if (!o || o.customer_id !== user.id || o.status !== "completed" || !vendorOrder) {
    redirect("/orders");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Leave a review</h1>
      <p className="mt-1 text-sm text-ink-500">
        {vendorOrder.vendors?.business_name}
      </p>
      <form action={createReview} className="mt-5 flex flex-col gap-4">
        <input type="hidden" name="vendor_order_id" value={vendorOrder.id} />
        <input type="hidden" name="vendor_id" value={vendorOrder.vendor_id} />
        <input
          type="hidden"
          name="product_id"
          value={vendorOrder.order_items?.[0]?.product_id ?? ""}
        />
        <Field label="Overall rating">
          <Select name="rating" required>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} — {["Poor", "Fair", "Good", "Very good", "Excellent"][r - 1]}
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
    </div>
  );
}
