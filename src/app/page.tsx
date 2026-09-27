import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getCustomerVehicles,
  getHeroSlides,
  getPopularSearches,
  getVerifiedProducts,
  searchProducts,
} from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";
import { HeroSlider, type HeroSlide } from "@/components/home/hero-slider";
import {
  IconCar,
  IconChevronRight,
  IconSearch,
  IconShield,
  IconTruck,
} from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

// Top-level category slugs worth featuring as their own sections.
const FEATURED_SLUGS = ["engines", "gearboxes", "suspension", "brakes", "electrical"];

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  let user = null;
  let categories: any[] = [];
  let verified: any[] = [];
  let popular: string[] = [];
  let vehicles: any[] = [];
  let slides: HeroSlide[] = [];
  let featuredSections: { category: any; products: any[] }[] = [];

  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    const [cats, ver, pop, veh, slideRes] = await Promise.all([
      getCategories(),
      getVerifiedProducts(8),
      getPopularSearches(),
      user ? getCustomerVehicles(user.id) : Promise.resolve([]),
      getHeroSlides(),
    ]);
    categories = cats;
    verified = ver;
    popular = pop;
    vehicles = veh;
    slides = slideRes as HeroSlide[];

    // Products for featured category sections (top-level categories only).
    const featured = categories.filter((c) =>
      FEATURED_SLUGS.includes(c.slug),
    );
    featuredSections = (
      await Promise.all(
        featured.map(async (c) => ({
          category: c,
          products: await searchProducts({ categoryId: c.id }),
        })),
      )
    ).filter((s) => s.products.length > 0);
  }

  const primaryVehicle = vehicles.find((v: any) => v.is_primary) ?? vehicles[0];

  return (
    <div>
      {/* Hero carousel — content managed in Admin → Hero */}
      <HeroSlider slides={slides} />

      {/* Search — directly under the hero */}
      <div className="mx-auto max-w-6xl px-4">
        <section className="-mt-8 relative z-10">
          <form
            action="/search"
            className="flex gap-2 rounded-2xl border border-surface-200 bg-white p-2 shadow-lg"
          >
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                name="q"
                placeholder="e.g. Mazda Demio new shape petrol engine"
                className="h-12 w-full rounded-xl bg-surface-50 pl-9 pr-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <button
              type="submit"
              className="tap h-12 rounded-xl bg-brand-700 px-5 text-sm font-medium text-white hover:bg-brand-800"
            >
              Search
            </button>
          </form>
        </section>

        {/* My Vehicle */}
        {configured ? (
          primaryVehicle ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700">
                <IconCar className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                  My vehicle
                </p>
                <p className="truncate text-sm font-semibold text-ink-900">
                  {primaryVehicle.vehicle_makes?.name}{" "}
                  {primaryVehicle.vehicle_models?.name}
                  {primaryVehicle.vehicle_generations?.name
                    ? ` • ${primaryVehicle.vehicle_generations.name}`
                    : ""}
                  {primaryVehicle.vehicle_engines?.name
                    ? ` • ${primaryVehicle.vehicle_engines.name}`
                    : ""}
                </p>
              </div>
              <ButtonLink
                href={`/search?generation_id=${primaryVehicle.generation_id ?? ""}&engine_id=${primaryVehicle.engine_id ?? ""}`}
                variant="outline"
                size="sm"
              >
                Find parts
              </ButtonLink>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-ink-400">
                <IconCar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-700">
                  Add your vehicle for exact-fit results
                </p>
              </div>
              <ButtonLink href="/garage" variant="outline" size="sm">
                Add vehicle
              </ButtonLink>
            </div>
          )
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Carguvi is live, but the marketplace database isn&apos;t connected
            yet. Set the Supabase environment variables to enable search and
            ordering.
          </div>
        )}

        {/* Trust strip */}
        <section className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            {
              icon: IconShield,
              title: "Carguvi confirmed",
              body: "Field agents physically verify stock on Kaguvi Street.",
            },
            {
              icon: IconTruck,
              title: "Pickup or delivery",
              body: "Collect at the vendor or get it delivered in Harare.",
            },
            {
              icon: IconCar,
              title: "Exact-fit search",
              body: "Filter by make, model, generation and engine.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{f.title}</p>
                <p className="text-xs leading-snug text-ink-500">{f.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Categories */}
        <section className="py-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">
              Shop by category
            </h2>
            <Link
              href="/categories"
              className="tap flex items-center text-sm font-medium text-brand-700"
            >
              All <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-10">
            {categories.slice(0, 10).map((c: any) => (
              <Link
                key={c.id}
                href={`/search?category_id=${c.id}`}
                className="tap flex flex-col items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-1 py-3 text-center hover:border-brand-200 hover:bg-brand-50"
              >
                <CategoryGlyph slug={c.slug} />
                <span className="text-[11px] font-medium leading-tight text-ink-700">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular searches */}
        {popular.length > 0 ? (
          <section className="pb-6">
            <h2 className="mb-3 text-base font-semibold text-ink-900">
              Popular searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {popular.map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="tap rounded-full border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-ink-700 hover:border-brand-300 hover:bg-brand-50"
                >
                  {q}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Featured category sections */}
        {featuredSections.map(({ category, products }) => (
          <section key={category.id} className="pb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">
                {category.name}
              </h2>
              <Link
                href={`/search?category_id=${category.id}`}
                className="tap flex items-center text-sm font-medium text-brand-700"
              >
                See all <IconChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {products.slice(0, 4).map((p: any) => (
                <ProductCard key={p.id} product={p} grid />
              ))}
            </div>
          </section>
        ))}

        {/* Verified near you */}
        {verified.length > 0 ? (
          <section className="pb-10">
            <div className="mb-3 flex items-center gap-2">
              <IconShield className="h-4 w-4 text-brand-600" />
              <h2 className="text-base font-semibold text-ink-900">
                Verified near you
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {verified.map((p) => (
                <ProductCard key={p.id} product={p} grid />
              ))}
            </div>
          </section>
        ) : null}

        {/* Vendor CTA */}
        <section className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 to-brand-900 p-6 text-white sm:p-8">
          <h2 className="text-xl font-bold">Got parts on Kaguvi Street?</h2>
          <p className="mt-1 max-w-md text-sm text-white/80">
            Reach buyers across Zimbabwe. List stock, confirm availability in
            one tap, get paid on delivery.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/vendor/apply">Start selling</ButtonLink>
            <ButtonLink
              href="/search?verified=1"
              variant="ghost"
              className="border border-white/30 text-white hover:bg-white/10"
            >
              Browse verified parts
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}

function CategoryGlyph({ slug }: { slug: string }) {
  const cls = "h-6 w-6 text-brand-700";
  const paths: Record<string, React.ReactNode> = {
    engines: (
      <>
        <rect x="5" y="7" width="14" height="11" rx="2" />
        <path d="M9 7V4h6v3M8 18v2M16 18v2M9 10.5h6" />
      </>
    ),
    gearboxes: (
      <>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 5v2.5M12 16.5V19M5 12h2.5M16.5 12H19" />
      </>
    ),
    brakes: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="7" r="0.8" />
        <circle cx="7.5" cy="14.5" r="0.8" />
        <circle cx="16.5" cy="14.5" r="0.8" />
      </>
    ),
    suspension: <path d="M12 3v3m0 0c-3 0-3 3 0 3s3 3 0 3-3 3 0 3 3 3 0 3m0 0v3" />,
    electrical: <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" />,
    "body-parts": (
      <>
        <path d="M4 16c0-3 2.5-5 5-5h1l3-4h5l2 4h1a2 2 0 0 1 0 5h-1.5" />
        <path d="M6 16h12" />
        <circle cx="8" cy="16" r="0.5" />
        <circle cx="16" cy="16" r="0.5" />
      </>
    ),
    tyres: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    batteries: (
      <>
        <rect x="3" y="8" width="18" height="10" rx="2" />
        <path d="M8 8V5h3v3M13 8V5h3v3M8 13h2M15 13h2" />
      </>
    ),
    "car-audio": (
      <>
        <rect x="4" y="7" width="16" height="10" rx="2" />
        <circle cx="9" cy="12" r="2" />
        <path d="M14 10.5h4M14 13.5h4" />
      </>
    ),
    accessories: (
      <>
        <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14.5 12 12 9.5l2.7-3.2Z" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls}
      aria-hidden
    >
      {paths[slug] ?? paths.accessories}
    </svg>
  );
}
