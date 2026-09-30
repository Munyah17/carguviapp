"use client";

import { useActionState } from "react";
import { importVehicleCatalogue, type VehicleImportState } from "../actions";
import { Button } from "@/components/ui/button";

export function VehicleImportForm() {
  const [state, formAction, pending] = useActionState<VehicleImportState, FormData>(
    importVehicleCatalogue,
    {},
  );

  return (
    <form action={formAction} className="mt-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-500">
            CSV or Excel file
          </span>
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            required
            className="block w-72 text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-800"
          />
        </label>
        <Button type="submit" size="md" disabled={pending}>
          {pending ? "Importing…" : "Import"}
        </Button>
      </div>
      {state.error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.summary ? (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.summary}
        </p>
      ) : null}
    </form>
  );
}
