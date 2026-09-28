"use client";

import { useActionState, useState } from "react";
import { uploadProductImage } from "@/lib/supabase/storage";
import { saveProduct, type VendorActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

interface Opt {
  id: number;
  name: string;
  make_id?: number | null;
  model_id?: number | null;
  generation_id?: number | null;
  year_start?: number | null;
  year_end?: number | null;
}

export function ProductForm({
  categories,
  makes,
  models,
  generations,
  engines,
  vendorId,
  product,
}: {
  categories: any[];
  makes: Opt[];
  models: Opt[];
  generations: Opt[];
  engines: Opt[];
  vendorId: string;
  product?: any;
}) {
  const [state, formAction, pending] = useActionState<
    VendorActionState,
    FormData
  >(saveProduct, {});

  const existingImage = product?.product_images?.sort(
    (a: any, b: any) => a.sort_order - b.sort_order,
  )?.[0]?.url;
  const [imageUrl, setImageUrl] = useState<string>(existingImage ?? "");
  const [uploading, setUploading] = useState(false);

  const [fitments, setFitments] = useState<FitmentRow[]>(
    (product?.product_compatibility?.length
      ? product.product_compatibility.map((c: any) => ({
          make_id: c.make_id ?? "",
          model_id: c.model_id ?? "",
          generation_id: c.generation_id ?? "",
          engine_id: c.engine_id ?? "",
          year_start: c.year_start ?? "",
          year_end: c.year_end ?? "",
        }))
      : [emptyFitment]),
  );

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-5">
      {product ? (
        <input type="hidden" name="product_id" value={product.id} />
      ) : null}

      <Field label="Title" hint="Make + model + part, e.g. Mazda Demio New Shape 1.3 Petrol Engine">
        <Input name="title" required defaultValue={product?.title} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <Select name="category_id" defaultValue={product?.category_id ?? ""}>
            <option value="">Choose…</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.parent_id ? "— " : ""}
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Condition">
          <Select name="condition" defaultValue={product?.condition ?? "used"}>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (USD)">
          <Input
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={product?.price}
          />
        </Field>
        <Field label="Quantity" hint="Leave empty for single used parts">
          <Input
            name="quantity"
            type="number"
            min={0}
            defaultValue={product?.quantity ?? ""}
          />
        </Field>
      </div>

      <Field label="Availability">
        <Select name="availability" defaultValue={product?.availability ?? "in_stock"}>
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="available_on_order">Available on order</option>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Part number">
          <Input name="part_number" defaultValue={product?.part_number ?? ""} />
        </Field>
        <Field label="OEM number">
          <Input name="oem_number" defaultValue={product?.oem_number ?? ""} />
        </Field>
      </div>

      <Field label="Description">
        <Textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          placeholder="Condition details, what's included, warranty…"
        />
      </Field>

      <Field
        label="Photo"
        hint="Clear, well-lit photo of the actual part builds buyer trust."
      >
        <div className="flex items-center gap-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Product"
              className="h-20 w-20 rounded-lg border border-surface-200 object-cover"
            />
          ) : null}
          <label className="tap cursor-pointer rounded-lg border border-dashed border-surface-300 px-4 py-2.5 text-sm font-medium text-ink-700 hover:border-brand-300 hover:bg-brand-50">
            {uploading
              ? "Uploading…"
              : imageUrl
                ? "Replace photo"
                : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  setImageUrl(await uploadProductImage(file, vendorId));
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
        </div>
        <input type="hidden" name="image_url" value={imageUrl} />
      </Field>

      <fieldset className="rounded-xl border border-surface-200 p-4">
        <legend className="px-1 text-sm font-semibold text-ink-900">
          Vehicle compatibility
        </legend>
        <p className="mb-3 text-xs text-ink-500">
          Add every vehicle this part fits. Leave a row empty for universal
          parts.
        </p>
        <div className="flex flex-col gap-4">
          {fitments.map((f, i) => (
            <FitmentFields
              key={i}
              row={f}
              index={i}
              removable={fitments.length > 1}
              onRemove={() =>
                setFitments((rows) => rows.filter((_, ri) => ri !== i))
              }
              onChange={(patch) =>
                setFitments((rows) =>
                  rows.map((r, ri) => (ri === i ? { ...r, ...patch } : r)),
                )
              }
              makes={makes}
              models={models}
              generations={generations}
              engines={engines}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFitments((rows) => [...rows, { ...emptyFitment }])}
          className="tap mt-3 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100"
        >
          + Add another vehicle
        </button>
      </fieldset>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            name="pickup_available"
            defaultChecked={product?.pickup_available ?? true}
            className="h-4 w-4"
          />
          Pickup available
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            name="delivery_available"
            defaultChecked={product?.delivery_available ?? true}
            className="h-4 w-4"
          />
          Carguvi Delivery
        </label>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : product ? "Save changes" : "Publish listing"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Multi-fitment rows — one vehicle per row, add/remove as needed. Submitted as
// parallel arrays (fitment_make[], fitment_model[], …) which FormData.getAll
// preserves in order.
// ---------------------------------------------------------------------------

interface FitmentRow {
  make_id: number | "";
  model_id: number | "";
  generation_id: number | "";
  engine_id: number | "";
  year_start: number | "";
  year_end: number | "";
}

const emptyFitment: FitmentRow = {
  make_id: "",
  model_id: "",
  generation_id: "",
  engine_id: "",
  year_start: "",
  year_end: "",
};

function FitmentFields({
  row,
  index,
  removable,
  onRemove,
  onChange,
  makes,
  models,
  generations,
  engines,
}: {
  row: FitmentRow;
  index: number;
  removable: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<FitmentRow>) => void;
  makes: Opt[];
  models: Opt[];
  generations: Opt[];
  engines: Opt[];
}) {
  const modelOpts = models.filter((m) => !row.make_id || m.make_id === row.make_id);
  const genOpts = generations.filter(
    (g) => !row.model_id || g.model_id === row.model_id,
  );
  const engOpts = engines.filter(
    (e) =>
      (!row.generation_id || e.generation_id === row.generation_id) &&
      (!row.model_id || !e.model_id || e.model_id === row.model_id),
  );

  const sel =
    "h-10 w-full rounded-lg border border-surface-300 bg-white px-2 text-sm text-ink-900";

  return (
    <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Vehicle {index + 1}
        </span>
        {removable ? (
          <button
            type="button"
            onClick={onRemove}
            className="tap text-xs font-medium text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select
          name="fitment_make"
          aria-label="Make"
          value={row.make_id}
          onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : "";
            onChange({ make_id: v, model_id: "", generation_id: "", engine_id: "" });
          }}
          className={sel}
        >
          <option value="">Any make</option>
          {makes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          name="fitment_model"
          aria-label="Model"
          value={row.model_id}
          onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : "";
            onChange({ model_id: v, generation_id: "", engine_id: "" });
          }}
          className={sel}
        >
          <option value="">Any model</option>
          {modelOpts.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          name="fitment_generation"
          aria-label="Generation"
          value={row.generation_id}
          onChange={(e) =>
            onChange({
              generation_id: e.target.value ? Number(e.target.value) : "",
              engine_id: "",
            })
          }
          className={sel}
        >
          <option value="">Any generation</option>
          {genOpts.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          name="fitment_engine"
          aria-label="Engine"
          value={row.engine_id}
          onChange={(e) =>
            onChange({
              engine_id: e.target.value ? Number(e.target.value) : "",
            })
          }
          className={sel}
        >
          <option value="">Any engine</option>
          {engOpts.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <Input
          name="fitment_year_start"
          type="number"
          placeholder="Year from — 2007"
          value={row.year_start}
          onChange={(e) =>
            onChange({
              year_start: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
        <Input
          name="fitment_year_end"
          type="number"
          placeholder="Year to — 2014"
          value={row.year_end}
          onChange={(e) =>
            onChange({
              year_end: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
}
