import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addAddress, removeAddress } from "./actions";
import { IconPin, IconTrash } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/addresses");

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Addresses</h1>

      <ul className="mt-4 space-y-3">
        {(addresses ?? []).map((a: any) => (
          <li
            key={a.id}
            className="flex items-start gap-3 rounded-xl border border-surface-200 bg-white p-4"
          >
            <IconPin className="mt-0.5 h-5 w-5 text-brand-600" />
            <div className="flex-1">
              <p className="font-medium text-ink-900">
                {a.label ?? "Address"}
                {a.is_default ? (
                  <Badge tone="blue" className="ml-2">
                    Default
                  </Badge>
                ) : null}
              </p>
              <p className="text-sm text-ink-500">
                {a.line1}, {a.area ? `${a.area}, ` : ""}
                {a.city}
              </p>
              {a.phone ? (
                <p className="text-xs text-ink-400">{a.phone}</p>
              ) : null}
            </div>
            <form
              action={async () => {
                "use server";
                await removeAddress(a.id);
              }}
            >
              <button
                className="tap rounded-lg p-2 text-ink-400 hover:text-red-600"
                aria-label="Delete address"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </form>
          </li>
        ))}
      </ul>

      <form
        action={addAddress}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-surface-200 bg-white p-4"
      >
        <h2 className="font-semibold text-ink-900">Add address</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Label">
            <Input name="label" placeholder="Home / Work" />
          </Field>
          <Field label="Phone">
            <Input name="phone" placeholder="+263 7â€¦" />
          </Field>
        </div>
        <Field label="Street address">
          <Input name="line1" required placeholder="e.g. 14 Mbuya Nehanda Close" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Area / Suburb">
            <Input name="area" placeholder="Borrowdale" />
          </Field>
          <Field label="City">
            <Input name="city" defaultValue="Harare" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" name="is_default" className="h-4 w-4 rounded border-surface-300" />
          Set as default
        </label>
        <Button type="submit">Save address</Button>
      </form>
    </div>
  );
}
