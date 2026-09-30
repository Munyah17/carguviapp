import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { VendorProfileForm } from "./settings-form";
import { BranchManager } from "./location-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Store settings" };

export default async function VendorSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
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
        <h2 className="font-semibold text-ink-900">Branches &amp; pickup points</h2>
        <p className="mt-1 text-xs text-ink-500">
          Manage every shop location. The primary branch is shown to customers
          first and used as the default pickup point.
        </p>
        <div className="mt-3">
          <BranchManager locations={locations ?? []} />
        </div>
      </section>
    </div>
  );
}
