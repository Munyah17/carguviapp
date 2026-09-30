import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inquiries" };

export default async function VendorInquiriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, products(title), profiles(full_name, phone)")
    .eq("vendor_id", info.vendor.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Customer inquiries</h1>
      <ul className="mt-4 space-y-3">
        {(inquiries ?? []).map((i: any) => (
          <li
            key={i.id}
            className="rounded-xl border border-surface-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink-900">
                {i.profiles?.full_name ?? i.name ?? "Customer"}
              </p>
              <Badge tone={i.status === "open" ? "amber" : "gray"}>
                {i.status}
              </Badge>
            </div>
            {i.products?.title ? (
              <p className="mt-0.5 text-xs text-ink-400">
                Re: {i.products.title}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-ink-700">{i.message}</p>
            <p className="mt-1 text-xs text-ink-400">
              {timeAgo(i.created_at)}
              {i.contact ? ` Â· ${i.contact}` : ""}
              {i.profiles?.phone ? ` Â· ${i.profiles.phone}` : ""}
            </p>
          </li>
        ))}
      </ul>
      {!inquiries?.length ? (
        <p className="mt-8 text-center text-sm text-ink-500">No inquiries.</p>
      ) : null}
    </div>
  );
}
