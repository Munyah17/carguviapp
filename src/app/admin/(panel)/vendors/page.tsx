import { createClient } from "@/lib/supabase/server";
import { timeAgo, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { setVendorStatus } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendors" };

const tone: Record<string, "green" | "amber" | "red" | "gray"> = {
  approved: "green",
  pending: "amber",
  suspended: "red",
  rejected: "gray",
};

export default async function AdminVendorsPage({
  searchParams,
}: PageProps<"/admin/vendors">) {
  const { status } = await searchParams;
  const supabase = await createClient();
  let q = supabase
    .from("vendors")
    .select("*, profiles:owner_user_id(full_name, email), vendor_metrics(*), vendor_locations(area)")
    .order("created_at", { ascending: false });
  if (typeof status === "string" && status) {
    q = q.eq(
      "status",
      status as "pending" | "approved" | "suspended" | "rejected",
    );
  }
  const { data: vendors } = await q;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Vendors</h1>
      <ul className="mt-4 space-y-3">
        {(vendors ?? []).map((v: any) => {
          const m = Array.isArray(v.vendor_metrics)
            ? v.vendor_metrics[0]
            : v.vendor_metrics;
          return (
            <li
              key={v.id}
              className="rounded-xl border border-surface-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-900">
                    {v.business_name}
                  </p>
                  <p className="text-sm text-ink-500">
                    {v.profiles?.full_name ?? v.profiles?.email} ·{" "}
                    {v.vendor_locations?.[0]?.area ?? v.city} · applied{" "}
                    {timeAgo(v.created_at)}
                  </p>
                </div>
                <Badge tone={tone[v.status]}>{v.status}</Badge>
              </div>
              {Array.isArray(v.business_documents) &&
              v.business_documents.length > 0 ? (
                <p className="mt-2 flex flex-wrap gap-2 text-xs">
                  {v.business_documents.map((doc: string, i: number) => (
                    <a
                      key={i}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 underline"
                    >
                      Document {i + 1}
                    </a>
                  ))}
                </p>
              ) : null}
              {v.status === "approved" && m ? (
                <p className="mt-2 text-xs text-ink-500">
                  Stock accuracy {Math.round(m.stock_accuracy ?? 0)}% ·
                  Fulfilment {Math.round(m.fulfilment_rate ?? 0)}% ·
                  Cancellation {Math.round(m.cancellation_rate ?? 0)}%
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                {v.status !== "approved" ? (
                  <form
                    action={async () => {
                      "use server";
                      await setVendorStatus(v.id, "approved");
                    }}
                  >
                    <button className="tap rounded-lg bg-trust-600 px-3 py-1.5 text-xs font-medium text-white">
                      Approve
                    </button>
                  </form>
                ) : null}
                {v.status === "approved" ? (
                  <form
                    action={async () => {
                      "use server";
                      await setVendorStatus(v.id, "suspended");
                    }}
                  >
                    <button className="tap rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-red-600">
                      Suspend
                    </button>
                  </form>
                ) : null}
                {v.status === "pending" ? (
                  <form
                    action={async () => {
                      "use server";
                      await setVendorStatus(v.id, "rejected");
                    }}
                  >
                    <button className="tap rounded-lg border border-surface-300 px-3 py-1.5 text-xs text-ink-700">
                      Reject
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
