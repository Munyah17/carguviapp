"use client";

import { useActionState } from "react";
import { submitSourcingRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

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
            <option value="south_africa">South Africa</option>
            <option value="dubai">Dubai</option>
            <option value="china">China</option>
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
        <>
          <Field label="Your name">
            <Input name="name" required />
          </Field>
          <Field label="Phone / WhatsApp / email">
            <Input name="contact" required placeholder="+263 7…" />
          </Field>
        </>
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
