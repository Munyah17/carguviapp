import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { saveHeroSlide, deleteHeroSlide } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hero slides — Admin" };

function SlideForm({ slide }: { slide?: any }) {
  return (
    <form action={saveHeroSlide} className="grid grid-cols-2 gap-3">
      <input type="hidden" name="id" value={slide?.id ?? ""} />
      <div className="col-span-2">
        <Field label="Title">
          <Input name="title" defaultValue={slide?.title} required />
        </Field>
      </div>
      <div className="col-span-2">
        <Field label="Description">
          <Input name="description" defaultValue={slide?.description ?? ""} />
        </Field>
      </div>
      <div className="col-span-2">
        <Field label="Background image URL" hint="e.g. /images/hero/hero-1.svg">
          <Input name="image_url" defaultValue={slide?.image_url ?? ""} />
        </Field>
      </div>
      <Field label="Overlay opacity (60–80)" hint="Dark overlay %">
        <Input
          name="overlay_opacity"
          type="number"
          min={0}
          max={95}
          defaultValue={slide?.overlay_opacity ?? 70}
        />
      </Field>
      <Field label="Sort order">
        <Input
          name="sort_order"
          type="number"
          defaultValue={slide?.sort_order ?? 0}
        />
      </Field>
      <Field label="Primary button label">
        <Input
          name="cta_primary_label"
          defaultValue={slide?.cta_primary_label ?? ""}
        />
      </Field>
      <Field label="Primary button link">
        <Input
          name="cta_primary_href"
          defaultValue={slide?.cta_primary_href ?? ""}
          placeholder="/search"
        />
      </Field>
      <Field label="Secondary button label">
        <Input
          name="cta_secondary_label"
          defaultValue={slide?.cta_secondary_label ?? ""}
        />
      </Field>
      <Field label="Secondary button link">
        <Input
          name="cta_secondary_href"
          defaultValue={slide?.cta_secondary_href ?? ""}
          placeholder="/vendor/apply"
        />
      </Field>
      <label className="col-span-2 flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={slide ? slide.is_active : true}
          className="h-4 w-4 rounded border-surface-300"
        />
        Visible on the home page
      </label>
      <div className="col-span-2">
        <Button type="submit">{slide ? "Save slide" : "Add slide"}</Button>
      </div>
    </form>
  );
}

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const { data: slides } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Hero slides</h1>
      <p className="mt-1 text-sm text-ink-500">
        Banners on the home page hero carousel — order, text, images and
        buttons are all editable here.
      </p>

      <ul className="mt-5 space-y-3">
        {(slides ?? []).map((s: any) => (
          <li
            key={s.id}
            className="rounded-xl border border-surface-200 bg-white"
          >
            <details className="group">
              <summary className="tap flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image_url}
                    alt=""
                    className="h-10 w-16 rounded-lg object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">
                    {s.sort_order}. {s.title}
                  </p>
                  <p className="truncate text-xs text-ink-400">
                    {s.description}
                  </p>
                </div>
                <Badge tone={s.is_active ? "green" : "gray"}>
                  {s.is_active ? "live" : "hidden"}
                </Badge>
              </summary>
              <div className="border-t border-surface-100 p-4">
                <SlideForm slide={s} />
                <form
                  action={async () => {
                    "use server";
                    await deleteHeroSlide(s.id);
                  }}
                  className="mt-3"
                >
                  <button className="text-sm font-medium text-red-600 hover:underline">
                    Delete slide
                  </button>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <details className="mt-6 rounded-xl border border-dashed border-surface-300 bg-surface-50">
        <summary className="tap cursor-pointer list-none px-4 py-3 text-sm font-semibold text-brand-700">
          + Add a new slide
        </summary>
        <div className="border-t border-surface-200 p-4">
          <SlideForm />
        </div>
      </details>
    </div>
  );
}
