import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  searchProducts,
  getCategories,
  getVehicleMakes,
  getVehicleModels,
  getVehicleGenerations,
  getVehicleEngines,
} from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";
import { IconSearch, IconShield } from "@/components/ui/icons";
import { signalDemand } from "@/lib/services/demand";
import { getAIProvider } from "@/lib/services/ai";
import { PhotoSearchButton } from "./photo-search";

export const dynamic = "force-dynamic";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const categoryId = num(sp.category_id);
  const makeId = num(sp.make_id);
  const modelId = num(sp.model_id);
  const generationId = num(sp.generation_id);
  const engineId = num(sp.engine_id);
  const condition = str(sp.condition);
  const availability = str(sp.availability);
  const verifiedOnly = sp.verified === "1";
  const minPrice = num(sp.min_price);
  const maxPrice = num(sp.max_price);
  const sort = str(sp.sort);

  let results: Awaited<ReturnType<typeof searchProducts>> = [];
  let aiNote: { make?: string; model?: string; keywords?: string[] } | null = null;
  const [initialResults, categories, makes, models, generations, engines] =
    await Promise.all([
      searchProducts({
        q,
        categoryId,
        makeId,
        modelId,
        generationId,
        engineId,
        condition,
        availability,
        verifiedOnly,
        minPrice,
        maxPrice,
        sort: (sort as any) ?? "relevance",
      }),
      getCategories(),
      getVehicleMakes(),
      makeId ? getVehicleModels(makeId) : getVehicleModels(),
      modelId ? getVehicleGenerations(modelId) : getVehicleGenerations(),
      generationId
        ? getVehicleEngines(generationId)
        : getVehicleEngines(),
    ]);
  results = initialResults;

  // Log the search for demand-triggered verification signals.
  if (q.trim()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("search_events").insert({
      user_id: user?.id ?? null,
      query: q.trim(),
      filters: { categoryId, makeId, modelId, generationId, engineId },
      results_count: results.length,
    });

    // Demand signal: nudge vendors whose stale listings just matched.
    signalDemand(results.map((r) => r.id)).catch(() => {});

    // AI-assisted interpretation: if the structured search found nothing,
    // retry with extracted keywords. Results still come from the database.
    if (results.length === 0) {
      const ai = getAIProvider();
      const interpretation = await ai.interpretSearch(q).catch(() => null);
      if (interpretation?.keywords?.length) {
        const alt = await searchProducts({
          q: interpretation.keywords.join(" "),
          categoryId,
          verifiedOnly,
          limit: 50,
        });
        if (alt.length) {
          results = alt;
          aiNote = interpretation;
        }
        await supabase.from("ai_events").insert({
          kind: "nl_search",
          provider: ai.name,
          prompt: { query: q },
          response: interpretation as any,
          user_id: user?.id ?? null,
        });
      }
    }
  }

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q,
      category_id: categoryId,
      make_id: makeId,
      model_id: modelId,
      generation_id: generationId,
      engine_id: engineId,
      condition,
      availability,
      verified: verifiedOnly ? "1" : undefined,
      min_price: minPrice,
      max_price: maxPrice,
      sort,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") params.set(k, String(v));
    }
    return `/search?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <form action="/search" className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Part name, number or vehicle…"
              className="h-11 w-full rounded-xl border border-surface-300 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            type="submit"
            className="tap h-11 rounded-xl bg-brand-700 px-4 text-sm font-medium text-white"
          >
            Search
          </button>
        </form>
        <PhotoSearchButton />
      </div>

      {/* Filters */}
      <details className="mt-3 rounded-xl border border-surface-200 bg-white">
        <summary className="tap cursor-pointer px-4 py-3 text-sm font-medium text-ink-700">
          Filters
          {vehicleSummary(makes, models, generations, engines, {
            makeId,
            modelId,
            generationId,
            engineId,
          }) ? (
            <span className="ml-2 text-xs font-normal text-brand-700">
              · vehicle selected
            </span>
          ) : null}
        </summary>
        <form action="/search" className="grid grid-cols-2 gap-3 border-t border-surface-200 p-4 sm:grid-cols-4">
          <input type="hidden" name="q" value={q} />
          <FilterSelect label="Category" name="category_id" value={categoryId}>
            <option value="">All categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Make" name="make_id" value={makeId}>
            <option value="">Any make</option>
            {makes.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Model" name="model_id" value={modelId}>
            <option value="">Any model</option>
            {models.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Generation"
            name="generation_id"
            value={generationId}
          >
            <option value="">Any generation</option>
            {generations.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Engine" name="engine_id" value={engineId}>
            <option value="">Any engine</option>
            {engines.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Condition" name="condition" value={condition}>
            <option value="">Any condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </FilterSelect>
          <FilterSelect
            label="Availability"
            name="availability"
            value={availability}
          >
            <option value="">Any</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="available_on_order">Available on order</option>
          </FilterSelect>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              name="verified"
              value="1"
              defaultChecked={verifiedOnly}
              className="h-4 w-4 rounded border-surface-300 text-brand-700"
            />
            <IconShield className="h-4 w-4 text-brand-600" />
            Carguvi confirmed
          </label>
          <div className="col-span-2 flex gap-2">
            <input
              name="min_price"
              type="number"
              min={0}
              placeholder="Min $"
              defaultValue={minPrice ?? ""}
              className="h-10 w-full rounded-lg border border-surface-300 px-3 text-sm"
            />
            <input
              name="max_price"
              type="number"
              min={0}
              placeholder="Max $"
              defaultValue={maxPrice ?? ""}
              className="h-10 w-full rounded-lg border border-surface-300 px-3 text-sm"
            />
          </div>
          <div className="col-span-2 flex gap-2 sm:col-span-4">
            <button
              type="submit"
              className="tap h-10 flex-1 rounded-lg bg-brand-700 text-sm font-medium text-white"
            >
              Apply filters
            </button>
            <Link
              href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
              className="tap flex h-10 items-center rounded-lg border border-surface-300 px-4 text-sm text-ink-700"
            >
              Clear
            </Link>
          </div>
        </form>
      </details>

      {/* Sort + count */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {results.length} result{results.length === 1 ? "" : "s"}
          {q ? (
            <>
              {" "}
              for <span className="font-medium text-ink-900">“{q}”</span>
            </>
          ) : null}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-400">Sort:</span>
          <SortLink href={buildQuery({ sort: "relevance" })} active={!sort || sort === "relevance"}>
            Best
          </SortLink>
          <SortLink href={buildQuery({ sort: "price_asc" })} active={sort === "price_asc"}>
            Price ↑
          </SortLink>
          <SortLink href={buildQuery({ sort: "price_desc" })} active={sort === "price_desc"}>
            Price ↓
          </SortLink>
          <SortLink href={buildQuery({ sort: "freshest" })} active={sort === "freshest"}>
            Freshest
          </SortLink>
        </div>
      </div>

      {/* Results */}
      {aiNote ? (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
          Interpreted your search
          {aiNote.keywords?.length
            ? ` as: ${aiNote.keywords.join(", ")}`
            : ""}
          .
        </p>
      ) : null}
      {results.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center">
          <p className="font-medium text-ink-700">No parts found</p>
          <p className="mt-1 text-sm text-ink-500">
            Try a different part name, remove filters, or{" "}
            <Link href="/inquiries/new" className="text-brand-700 underline">
              ask vendors
            </Link>{" "}
            to source it for you.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 pb-10 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value?: string | number;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-10 w-full rounded-lg border border-surface-300 bg-white px-2 text-sm text-ink-900"
      >
        {children}
      </select>
    </label>
  );
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "font-medium text-brand-700"
          : "tap text-ink-500 hover:text-ink-700"
      }
    >
      {children}
    </Link>
  );
}

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : undefined;
}
function str(v: unknown): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}
function vehicleSummary(
  _makes: any[],
  _models: any[],
  _gens: any[],
  _engs: any[],
  sel: { makeId?: number; modelId?: number; generationId?: number; engineId?: number },
): boolean {
  return !!(sel.makeId || sel.modelId || sel.generationId || sel.engineId);
}
