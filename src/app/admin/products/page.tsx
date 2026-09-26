import { createClient } from "@/lib/supabase/server";
import { formatPrice, daysSince, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { setProductStatus } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const { stale } = await searchParams;
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select(
      "id, title, price, availability, status, carguvi_verified_at, seller_confirmed_at, seller_updated_at, created_at, vendors(business_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const list = (products ?? []).filter((p: any) => {
    if (stale !== "1") return true;
    const d = daysSince(
      p.carguvi_verified_at ?? p.seller_confirmed_at ?? p.seller_updated_at,
    );
    return d === null || d > 14;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">
        Products{stale === "1" ? " — stale" : ""}
      </h1>
      <ul className="mt-4 space-y-2">
        {list.map((p: any) => (
          <li
            key={p.id}
            className="rounded-xl border border-surface-200 bg-white px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">
                  {p.title}
                </p>
                <p className="text-xs text-ink-500">
                  {p.vendors?.business_name} · {formatPrice(p.price)} ·{" "}
                  {p.status} · last confirmed{" "}
                  {timeAgo(p.carguvi_verified_at ?? p.seller_confirmed_at) ||
                    "never"}
                </p>
              </div>
              <Badge tone={p.status === "active" ? "green" : "gray"}>
                {p.availability.replace(/_/g, " ")}
              </Badge>
            </div>
            {p.status === "active" ? (
              <form
                action={async () => {
                  "use server";
                  await setProductStatus(p.id, "archived");
                }}
                className="mt-2"
              >
                <button className="tap text-xs font-medium text-red-600 underline">
                  Archive listing
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
