import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { startTask, submitVerification } from "../../actions";

export const dynamic = "force-dynamic";

export default async function VerificationTaskPage({
  params,
}: PageProps<"/enumerator/tasks/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const roles = await getUserRoles(user.id);
  if (!roles.includes("enumerator") && !roles.includes("admin") && !roles.includes("super_admin")) {
    redirect("/");
  }

  const { data: task } = await supabase
    .from("verification_tasks")
    .select(
      `*, vendors(business_name, vendor_locations(address, area, city)),
       products(title, price, availability, condition, product_images(url))`,
    )
    .eq("id", id)
    .single();
  if (!task) notFound();

  const vendor = task.vendors as any;
  const product = task.products as any;
  const loc = vendor?.vendor_locations?.[0];

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-10">
      <Badge tone={task.status === "started" ? "blue" : "amber"}>
        {task.status}
      </Badge>
      <h1 className="mt-2 text-xl font-bold text-ink-900">
        {vendor?.business_name}
      </h1>
      <p className="text-sm text-ink-500">
        {loc?.address}
        {loc?.area ? `, ${loc.area}` : ""} —{" "}
        <span className="capitalize">{task.task_type.replace(/_/g, " ")}</span>
      </p>

      {product ? (
        <div className="mt-4 rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
            Listing on Carguvi
          </p>
          <p className="mt-1 font-semibold text-ink-900">{product.title}</p>
          <p className="mt-1 text-sm text-ink-700">
            Listed at {formatPrice(product.price)} ·{" "}
            <span className="capitalize">
              {String(product.availability).replace(/_/g, " ")}
            </span>{" "}
            · <span className="capitalize">{product.condition}</span>
          </p>
        </div>
      ) : null}

      {task.status === "assigned" ? (
        <form
          action={async () => {
            "use server";
            await startTask(task.id);
          }}
          className="mt-6"
        >
          <Button type="submit" size="lg" className="w-full">
            Start verification
          </Button>
        </form>
      ) : (
        <form action={submitVerification} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="task_id" value={task.id} />
          <Field label="Observed availability">
            <Select
              name="observed_availability"
              defaultValue={product?.availability ?? "in_stock"}
            >
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="available_on_order">On order</option>
            </Select>
          </Field>
          <Field
            label="Observed price (USD)"
            hint="Enter the physical price. A mismatch is recorded as a discrepancy — we never silently overwrite the vendor's price."
          >
            <Input
              name="observed_price"
              type="number"
              step="0.01"
              placeholder={product ? String(product.price) : ""}
            />
          </Field>
          <Field label="Photo URL" hint="Uploads to Supabase Storage in production">
            <Input name="photo_url" placeholder="/images/parts/engine.svg" />
          </Field>
          <Field label="Notes">
            <Textarea
              name="notes"
              rows={3}
              placeholder="Condition, shop observations, follow-ups…"
            />
          </Field>
          <Button type="submit" size="lg">
            Submit verification
          </Button>
          <p className="text-xs text-ink-400">
            Customers will see &quot;Carguvi confirmed&quot; — the internal
            process stays invisible.
          </p>
        </form>
      )}
    </div>
  );
}
