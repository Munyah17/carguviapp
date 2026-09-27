"use client";

import { useActionState, useMemo, useState } from "react";
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

  const initialCompat = product?.product_compatibility?.[0];
  const existingImage = product?.product_images?.sort(
    (a: any, b: any) => a.sort_order - b.sort_order,
  )?.[0]?.url;
  const [imageUrl, setImageUrl] = useState<string>(existingImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [makeId, setMakeId] = useState<number | "">(initialCompat?.make_id ?? "");
  const [modelId, setModelId] = useState<number | "">(initialCompat?.model_id ?? "");
  const [generationId, setGenerationId] = useState<number | "">(
    initialCompat?.generation_id ?? "",
  );

  const modelOpts = useMemo(
    () => models.filter((m) => !makeId || m.make_id === makeId),
    [models, makeId],
  );
  const genOpts = useMemo(
    () => generations.filter((g) => !modelId || g.model_id === modelId),
    [generations, modelId],
  );
  const engOpts = useMemo(
    () =>
      engines.filter(
        (e) =>
          (!generationId || e.generation_id === generationId) &&
          (!modelId || !e.model_id || e.model_id === modelId),
      ),
    [engines, generationId, modelId],
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Make">
            <Select
              name="make_id"
              value={makeId}
              onChange={(e) => {
                setMakeId(e.target.value ? Number(e.target.value) : "");
                setModelId("");
                setGenerationId("");
              }}
            >
              <option value="">Any</option>
              {makes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Model">
            <Select
              name="model_id"
              value={modelId}
              onChange={(e) => {
                setModelId(e.target.value ? Number(e.target.value) : "");
                setGenerationId("");
              }}
            >
              <option value="">Any</option>
              {modelOpts.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Generation">
            <Select
              name="generation_id"
              value={generationId}
              onChange={(e) =>
                setGenerationId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Any</option>
              {genOpts.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Engine">
            <Select
              name="engine_id"
              defaultValue={initialCompat?.engine_id ?? ""}
            >
              <option value="">Any</option>
              {engOpts.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Year from">
            <Input
              name="year_start"
              type="number"
              placeholder="2007"
              defaultValue={initialCompat?.year_start ?? ""}
            />
          </Field>
          <Field label="Year to">
            <Input
              name="year_end"
              type="number"
              placeholder="2014"
              defaultValue={initialCompat?.year_end ?? ""}
            />
          </Field>
        </div>
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
