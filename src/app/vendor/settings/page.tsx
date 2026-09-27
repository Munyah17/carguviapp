import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { VendorProfileForm } from "./settings-form";
import { LocationForm } from "./location-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Store settings" };

export default async function VendorSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");

  const { data: locations } = await supabase
    .from("vendor_locations")
    .select("*")
    .eq("vendor_id", info.vendor.id)
    .order("is_primary", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Store settings</h1>

      <section className="mt-5 rounded-xl border border-surface-200 bg-white p-4">
        <VendorProfileForm vendor={info.vendor} />
      </section>

      <section className="mt-6 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Pickup locations</h2>
        <ul className="mt-3 space-y-2">
          {(locations ?? []).map((l: any) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded-lg border border-surface-200 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-ink-900">
                  {l.name}
                  {l.is_primary ? (
                    <Badge tone="blue" className="ml-2">primary</Badge>
                  ) : null}
                </p>
                <p className="text-xs text-ink-500">
                  {l.address}
                  {l.area ? `, ${l.area}` : ""}
                </p>
              </div>
              <div className="flex gap-1.5">
                {l.pickup_available ? <Badge tone="green">pickup</Badge> : null}
                {l.delivery_available ? <Badge tone="blue">delivery</Badge> : null}
              </div>
            </li>
          ))}
          {!locations?.length ? (
            <p className="text-sm text-ink-500">
              No locations yet — customers won&apos;t be able to choose pickup.
            </p>
          ) : null}
        </ul>
        <div className="mt-4 border-t border-surface-200 pt-4">
          <h3 className="text-sm font-semibold text-ink-900">Add location</h3>
          <LocationForm />
        </div>
      </section>
    </div>
  );
}
