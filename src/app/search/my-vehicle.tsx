"use client";

import { useRouter, useSearchParams } from "next/navigation";

export interface GarageVehicle {
  id: string;
  label: string;
  make_id: number;
  model_id: number;
  generation_id: number | null;
  engine_id: number | null;
}

/**
 * "My vehicle" quick filter — applies the customer's garage vehicle to the
 * search params (make/model/generation/engine) in one tap.
 */
export function MyVehicleSelect({ vehicles }: { vehicles: GarageVehicle[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  if (!vehicles.length) return null;

  const active = vehicles.find(
    (v) =>
      v.make_id === Number(sp.get("make_id")) &&
      v.model_id === Number(sp.get("model_id")),
  );

  return (
    <select
      value={active?.id ?? ""}
      onChange={(e) => {
        const v = vehicles.find((x) => x.id === e.target.value);
        const params = new URLSearchParams(sp.toString());
        if (v) {
          params.set("make_id", String(v.make_id));
          params.set("model_id", String(v.model_id));
          if (v.generation_id) params.set("generation_id", String(v.generation_id));
          else params.delete("generation_id");
          if (v.engine_id) params.set("engine_id", String(v.engine_id));
          else params.delete("engine_id");
        } else {
          ["make_id", "model_id", "generation_id", "engine_id"].forEach((k) =>
            params.delete(k),
          );
        }
        router.push(`/search?${params.toString()}`);
      }}
      className="h-11 rounded-xl border border-surface-300 bg-white px-3 text-sm text-ink-700"
      aria-label="Filter by my vehicle"
    >
      <option value="">All vehicles</option>
      {vehicles.map((v) => (
        <option key={v.id} value={v.id}>
          {v.label}
        </option>
      ))}
    </select>
  );
}
