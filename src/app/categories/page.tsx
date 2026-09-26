import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IconChevronRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  const all = data ?? [];
  const parents = all.filter((c: any) => !c.parent_id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Browse categories</h1>
      <div className="mt-4 divide-y divide-surface-200 rounded-xl border border-surface-200 bg-white">
        {parents.map((c: any) => {
          const children = all.filter((x: any) => x.parent_id === c.id);
          return (
            <div key={c.id} className="p-4">
              <Link
                href={`/search?category_id=${c.id}`}
                className="tap flex items-center justify-between font-semibold text-ink-900"
              >
                {c.name}
                <IconChevronRight className="h-4 w-4 text-ink-400" />
              </Link>
              {children.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {children.map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/search?category_id=${s.id}`}
                      className="tap rounded-full border border-surface-300 px-3 py-1 text-sm text-ink-700 hover:border-brand-300 hover:bg-brand-50"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
