import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { createInquiry } from "./actions";

export const metadata = { title: "Ask a vendor" };

export default async function NewInquiryPage({
  searchParams,
}: PageProps<"/inquiries/new">) {
  const { vendor, product } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, business_name")
    .eq("status", "approved")
    .order("business_name");

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Ask a vendor</h1>
      <p className="mt-1 text-sm text-ink-500">
        Can&apos;t find a part? Vendors can source it for you.
      </p>
      <form action={createInquiry} className="mt-5 flex flex-col gap-4">
        <Field label="Vendor">
          <Select
            name="vendor_id"
            required
            defaultValue={typeof vendor === "string" ? vendor : ""}
          >
            <option value="" disabled>
              Choose a vendor…
            </option>
            {(vendors ?? []).map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.business_name}
              </option>
            ))}
          </Select>
        </Field>
        <input
          type="hidden"
          name="product_id"
          value={typeof product === "string" ? product : ""}
        />
        {!user ? (
          <>
            <Field label="Your name">
              <Input name="name" required />
            </Field>
            <Field label="Phone or WhatsApp">
              <Input name="contact" required placeholder="+263 7…" />
            </Field>
          </>
        ) : null}
        <Field label="What are you looking for?">
          <Textarea
            name="message"
            required
            rows={4}
            placeholder="e.g. Do you have a Mazda Demio new shape 1.3 petrol engine? My car is a 2011."
          />
        </Field>
        <Button type="submit" size="lg">
          Send inquiry
        </Button>
      </form>
    </div>
  );
}
