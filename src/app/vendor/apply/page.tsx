"use client";

import { useActionState } from "react";
import Link from "next/link";
import { applyToSell, type VendorActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

export default function VendorApplyPage() {
  const [state, formAction, pending] = useActionState<VendorActionState, FormData>(
    applyToSell,
    {},
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-10">
      <h1 className="text-2xl font-bold text-ink-900">Sell on Carguvi</h1>
      <p className="mt-1 text-sm text-ink-500">
        Open a digital storefront for your parts business. A Carguvi admin will
        verify your shop before it goes live.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <Field label="Business name">
          <Input name="business_name" required placeholder="e.g. Mambo Auto Parts" />
        </Field>
        <Field label="Contact person">
          <Input name="contact_person" placeholder="Owner / manager name" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <Input name="phone" type="tel" required placeholder="+263 7…" />
          </Field>
          <Field label="WhatsApp (optional)">
            <Input name="whatsapp" type="tel" placeholder="+263 7…" />
          </Field>
        </div>
        <Field label="Email">
          <Input name="email" type="email" />
        </Field>
        <Field label="Physical address">
          <Input
            name="physical_address"
            required
            placeholder="e.g. Stand 12, Kaguvi Street"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Operating area">
            <Input name="operating_area" placeholder="Kaguvi Street" />
          </Field>
          <Field label="City">
            <Select name="city" defaultValue="Harare">
              <option>Harare</option>
              <option>Bulawayo</option>
              <option>Mutare</option>
              <option>Gweru</option>
              <option>Other</option>
            </Select>
          </Field>
        </div>
        <Field
          label="About your business"
          hint="What parts do you specialise in? Which vehicles?"
        >
          <Textarea name="description" rows={3} />
        </Field>
        <Field
          label="Business documents (optional)"
          hint="Registration, trading licence or ID — speeds up verification. PDF or photo."
        >
          <input
            type="file"
            name="documents"
            multiple
            accept="image/*,application/pdf"
            className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700"
          />
        </Field>

        {state.error === "sign_in_required" ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You need an account first.{" "}
            <Link href="/auth/register" className="font-medium underline">
              Register
            </Link>{" "}
            or{" "}
            <Link href="/auth/sign-in?next=/vendor/apply" className="font-medium underline">
              sign in
            </Link>
            , then submit again.
          </p>
        ) : state.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    </div>
  );
}
