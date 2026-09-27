"use client";

import { useActionState } from "react";
import { updateVendorProfile, type VendorActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

export function VendorProfileForm({ vendor }: { vendor: any }) {
  const [state, formAction, pending] = useActionState<VendorActionState, FormData>(
    updateVendorProfile,
    {},
  );
  const pd = vendor.payment_details ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Business name">
        <Input name="business_name" required defaultValue={vendor.business_name} />
      </Field>
      <Field label="About your business">
        <Textarea name="description" rows={3} defaultValue={vendor.description ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <Input name="phone" type="tel" defaultValue={vendor.phone ?? ""} />
        </Field>
        <Field label="WhatsApp">
          <Input name="whatsapp" type="tel" defaultValue={vendor.whatsapp ?? ""} />
        </Field>
      </div>
      <Field label="Email">
        <Input name="email" type="email" defaultValue={vendor.email ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Operating area">
          <Input name="operating_area" defaultValue={vendor.operating_area ?? ""} placeholder="Kaguvi Street" />
        </Field>
        <Field label="City">
          <Input name="city" defaultValue={vendor.city ?? "Harare"} />
        </Field>
      </div>

      <h3 className="mt-2 font-semibold text-ink-900">Payout details</h3>
      <p className="-mt-2 text-xs text-ink-500">
        Used by Carguvi to remit your earnings. Only visible to you and Carguvi
        operations.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="EcoCash merchant number">
          <Input name="ecocash" defaultValue={pd.ecocash ?? ""} />
        </Field>
        <Field label="Innbucks (optional)">
          <Input name="innbucks" defaultValue={pd.innbucks ?? ""} />
        </Field>
      </div>
      <Field label="Bank details (optional)">
        <Input name="bank" defaultValue={pd.bank ?? ""} placeholder="Bank · branch · account" />
      </Field>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : state.ok ? (
        <p className="rounded-lg bg-trust-50 px-3 py-2 text-sm text-trust-700">
          Saved.
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
