import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { daysSince, timeAgo, formatPrice } from "@/lib/format";
import { confirmListing, confirmAllListings } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirm listings" };

const STALE_DAYS = 14;

export default async function ConfirmationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, title, price, availability, seller_confirmed_at, seller_updated_at, carguvi_verified_at, view_count",
    )
    .eq("vendor_id", info.vendor.id)
    .eq("status", "active")
    .order("view_count", { ascending: false });

  const stale = (products ?? []).filter((p: any) => {
    if (["out_of_stock"].includes(p.availability)) return false;
    const days = daysSince(
      p.carguvi_verified_at ?? p.seller_confirmed_at ?? p.seller_updated_at,
    );
    return days === null || days > STALE_DAYS;
  });

  // Prioritise stale listings customers are looking at.
  const priority = stale
    .sort((a: any, b: any) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Confirm listings</h1>
      <p className="mt-1 text-sm text-ink-500">
        Customers trust fresh listings. Confirm items that are still available —
        or mark them sold.
      </p>

      {stale.length === 0 ? (
        <div className="mt-8 rounded-xl border border-trust-100 bg-trust-50 p-6 text-center">
          <p className="font-medium text-trust-700">
            All listings are fresh. Nice work.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-ink-900">
              {stale.length} listing{stale.length === 1 ? "" : "s"} need
              confirmation
            </p>
            <p className="mt-0.5 text-xs text-ink-500">
              Customers are currently viewing these most:
            </p>
            <form
              action={async () => {
                "use server";
                await confirmAllListings(stale.map((p: any) => p.id));
              }}
              className="mt-3"
            >
              <button className="tap w-full rounded-lg bg-trust-600 py-2.5 text-sm font-medium text-white">
                Confirm all {stale.length} still available
              </button>
            </form>
          </div>

          <ul className="mt-4 space-y-3">
            {stale.map((p: any) => {
              const isHot = priority.some((x: any) => x.id === p.id);
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-surface-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatPrice(p.price)} · last confirmed{" "}
                        {timeAgo(p.seller_confirmed_at ?? p.seller_updated_at) ||
                          "never"}
                        {isHot ? (
                          <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700">
                            customers searching
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await confirmListing(p.id, "available");
                      }}
                    >
                      <button className="tap rounded-lg bg-trust-600 px-3 py-1.5 text-xs font-medium text-white">
                        Yes, still available
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await confirmListing(p.id, "sold");
                      }}
                    >
                      <button className="tap rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-red-600">
                        Sold
                      </button>
                    </form>
                    <a
                      href={`/vendor/products/${p.id}/edit`}
                      className="tap rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-ink-700"
                    >
                      Update listing
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
