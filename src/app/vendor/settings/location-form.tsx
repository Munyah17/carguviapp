"use client";

import { savePickupLocation } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

export function LocationForm() {
  return (
    <form action={savePickupLocation} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location name">
          <Input name="name" required placeholder="Main shop" />
        </Field>
        <Field label="Area">
          <Input name="area" placeholder="Kaguvi Street" />
        </Field>
      </div>
      <Field label="Address">
        <Input name="address" required placeholder="Stand / street address" />
      </Field>
      <Field label="Pickup instructions" hint="e.g. Ask for Tendai at the counter">
        <Input name="pickup_instructions" />
      </Field>
      <div className="flex gap-6 text-sm text-ink-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="pickup_available" defaultChecked className="h-4 w-4" />
          Pickup available
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="delivery_available" defaultChecked className="h-4 w-4" />
          Delivery available
        </label>
      </div>
      <Button type="submit" variant="outline" size="sm" className="self-start">
        Add location
      </Button>
    </form>
  );
}
