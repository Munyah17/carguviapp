"use client";

import { useState } from "react";
import {
  savePickupLocation,
  setPrimaryLocation,
  deleteLocation,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Location {
  id: string;
  name: string;
  address: string;
  area: string | null;
  is_primary: boolean;
  pickup_available: boolean;
  pickup_instructions: string | null;
  delivery_available: boolean;
}

export function BranchManager({ locations }: { locations: Location[] }) {
  const [editing, setEditing] = useState<Location | null>(null);

  return (
    <div>
      <ul className="space-y-2">
        {locations.map((l) => (
          <li
            key={l.id}
            className="rounded-lg border border-surface-200 px-3 py-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-900">
                  {l.name}
                  {l.is_primary ? (
                    <Badge tone="blue" className="ml-2">
                      primary
                    </Badge>
                  ) : null}
                </p>
                <p className="text-xs text-ink-500">
                  {l.address}
                  {l.area ? `, ${l.area}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {l.pickup_available ? <Badge tone="green">pickup</Badge> : null}
                {l.delivery_available ? <Badge tone="blue">delivery</Badge> : null}
              </div>
            </div>
            <div className="mt-2 flex gap-3 text-xs font-medium">
              <button
                type="button"
                onClick={() => setEditing(editing?.id === l.id ? null : l)}
                className="tap text-brand-700 hover:text-brand-800"
              >
                {editing?.id === l.id ? "Cancel" : "Edit"}
              </button>
              {!l.is_primary ? (
                <>
                  <form
                    action={async () => {
                      await setPrimaryLocation(l.id);
                    }}
                    className="inline"
                  >
                    <button type="submit" className="tap text-ink-600 hover:text-ink-900">
                      Make primary
                    </button>
                  </form>
                  <form
                    action={async () => {
                      if (confirm(`Remove branch "${l.name}"?`)) {
                        await deleteLocation(l.id);
                      }
                    }}
                    className="inline"
                  >
                    <button type="submit" className="tap text-red-600 hover:text-red-800">
                      Remove
                    </button>
                  </form>
                </>
              ) : null}
            </div>
            {editing?.id === l.id ? (
              <div className="mt-3 border-t border-surface-100 pt-3">
                <LocationForm location={l} />
              </div>
            ) : null}
          </li>
        ))}
        {!locations.length ? (
          <p className="text-sm text-ink-500">
            No branches yet — customers won&apos;t be able to choose pickup.
          </p>
        ) : null}
      </ul>
      <div className="mt-4 border-t border-surface-200 pt-4">
        <h3 className="text-sm font-semibold text-ink-900">Add branch</h3>
        <LocationForm />
      </div>
    </div>
  );
}

export function LocationForm({ location }: { location?: Location }) {
  return (
    <form action={savePickupLocation} className="mt-2 flex flex-col gap-3">
      {location ? (
        <input type="hidden" name="location_id" value={location.id} />
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Branch name">
          <Input
            name="name"
            required
            placeholder="Main shop"
            defaultValue={location?.name}
          />
        </Field>
        <Field label="Area">
          <Input
            name="area"
            placeholder="Kaguvi Street"
            defaultValue={location?.area ?? ""}
          />
        </Field>
      </div>
      <Field label="Address">
        <Input
          name="address"
          required
          placeholder="Stand / street address"
          defaultValue={location?.address}
        />
      </Field>
      <Field label="Pickup instructions" hint="e.g. Ask for Tendai at the counter">
        <Input name="pickup_instructions" defaultValue={location?.pickup_instructions ?? ""} />
      </Field>
      <div className="flex gap-6 text-sm text-ink-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="pickup_available"
            defaultChecked={location?.pickup_available ?? true}
            className="h-4 w-4"
          />
          Pickup available
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="delivery_available"
            defaultChecked={location?.delivery_available ?? true}
            className="h-4 w-4"
          />
          Delivery available
        </label>
      </div>
      <Button type="submit" variant="outline" size="sm" className="self-start">
        {location ? "Save branch" : "Add branch"}
      </Button>
    </form>
  );
}
