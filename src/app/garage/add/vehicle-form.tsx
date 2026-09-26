"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

interface Opt {
  id: number;
  name: string;
  make_id?: number | null;
  model_id?: number | null;
  generation_id?: number | null;
  year_start?: number | null;
  year_end?: number | null;
}

export function VehicleForm({
  makes,
  models,
  generations,
  engines,
  action,
}: {
  makes: Opt[];
  models: Opt[];
  generations: Opt[];
  engines: Opt[];
  action: (fd: FormData) => Promise<void>;
}) {
  const [makeId, setMakeId] = useState<number | "">("");
  const [modelId, setModelId] = useState<number | "">("");
  const [generationId, setGenerationId] = useState<number | "">("");

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

  const years = useMemo(() => {
    const g = generations.find((x) => x.id === generationId);
    const start = g?.year_start ?? 1990;
    const end = g?.year_end ?? new Date().getFullYear();
    const list: number[] = [];
    for (let y = end; y >= start; y--) list.push(y);
    return list;
  }, [generations, generationId]);

  return (
    <form action={action} className="mt-5 flex flex-col gap-4">
      <Field label="Make">
        <Select
          name="make_id"
          required
          value={makeId}
          onChange={(e) => {
            setMakeId(e.target.value ? Number(e.target.value) : "");
            setModelId("");
            setGenerationId("");
          }}
        >
          <option value="">Select make…</option>
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
          required
          value={modelId}
          disabled={!makeId}
          onChange={(e) => {
            setModelId(e.target.value ? Number(e.target.value) : "");
            setGenerationId("");
          }}
        >
          <option value="">Select model…</option>
          {modelOpts.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Generation" hint='e.g. "New Shape" — optional but improves fitment matching.'>
        <Select
          name="generation_id"
          value={generationId}
          disabled={!modelId}
          onChange={(e) =>
            setGenerationId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Any generation</option>
          {genOpts.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
              {g.year_start ? ` (${g.year_start}–${g.year_end ?? "?"})` : ""}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Engine">
        <Select name="engine_id" disabled={!modelId}>
          <option value="">Any engine</option>
          {engOpts.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Year">
        <Select name="year">
          <option value="">Unknown</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Nickname (optional)">
        <Input name="nickname" placeholder="e.g. My Demio" />
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          name="is_primary"
          className="h-4 w-4 rounded border-surface-300 text-brand-700"
        />
        Set as my primary vehicle
      </label>
      <Button type="submit" size="lg">
        Save vehicle
      </Button>
    </form>
  );
}
