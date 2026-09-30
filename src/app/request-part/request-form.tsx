"use client";

import { useActionState, useRef, useState } from "react";
import { submitSourcingRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

function PhotoPicker({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();
  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="tap flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 px-4 py-4 text-sm font-medium text-brand-800 hover:border-brand-400 hover:bg-brand-100"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
          <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
        {fileName ?? label}
      </button>
      <input
        ref={ref}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name)}
      />
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </div>
  );
}

export function RequestForm({
  prefillPart,
  signedIn,
}: {
  prefillPart: string;
  signedIn: boolean;
}) {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(
    submitSourcingRequest,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Which part do you need?">
        <Input
          name="part_name"
          required
          defaultValue={prefillPart}
          placeholder="e.g. Mazda Demio engine, Toyota Corolla headlight"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Part number (if known)">
          <Input name="part_number" placeholder="OEM / aftermarket no." />
        </Field>
        <Field label="Quantity">
          <Input name="quantity" type="number" min={1} defaultValue="1" />
        </Field>
      </div>
      <Field
        label="Your vehicle"
        hint="Make, model, year, engine — e.g. Mazda Demio 2011 1.3 petrol"
      >
        <Input name="vehicle" placeholder="Mazda Demio 2011 1.3 petrol" />
      </Field>

      {/* Photos — biggest driver of accurate quotes */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3">
        <p className="mb-2 text-sm font-medium text-ink-900">
          Add photos for a more accurate quote
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PhotoPicker
            name="vehicle_photo"
            label="Photo of your vehicle"
            hint="Helps us confirm the exact model and trim."
          />
          <PhotoPicker
            name="part_photo"
            label="Photo of the part"
            hint="If you have the old/broken part, a photo avoids wrong-fit orders."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Condition">
          <Select name="condition" defaultValue="any">
            <option value="any">Any condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </Select>
        </Field>
        <Field label="Preferred source">
          <Select name="source" defaultValue="any">
            <option value="any">Fastest available</option>
            <option value="south_africa">South Africa (3–14 days)</option>
            <option value="dubai">Dubai (7–21 days)</option>
            <option value="china">China (4–12 weeks)</option>
            <option value="japan">Japan (4–12 weeks)</option>
          </Select>
        </Field>
      </div>
      <Field label="Anything else we should know?">
        <Textarea
          name="notes"
          rows={3}
          placeholder="VIN, colour, urgency, budget…"
        />
      </Field>
      {!signedIn ? (
        <div className="rounded-xl border border-surface-200 bg-surface-50 p-3">
          <p className="mb-2 text-sm font-medium text-ink-900">
            Your contact details
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Your name">
              <Input name="name" required placeholder="e.g. Tendai Moyo" />
            </Field>
            <Field label="Phone / WhatsApp / email">
              <Input name="contact" required placeholder="+263 7…" />
            </Field>
          </div>
          <p className="mt-2 text-xs text-ink-400">
            No account needed — we&apos;ll send your quotation here.
          </p>
        </div>
      ) : (
        <input type="hidden" name="contact" value="" />
      )}
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Request quotation"}
      </Button>
    </form>
  );
}
