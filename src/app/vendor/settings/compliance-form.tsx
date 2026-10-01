"use client";

import { useActionState, useRef, useState } from "react";
import { uploadComplianceDoc, type VendorActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DOC_TYPES: [string, string][] = [
  ["registration_cert", "Company registration certificate"],
  ["cr5", "CR5 (registered office)"],
  ["cr6", "CR6 (registered address)"],
  ["cr14", "CR14 (directors)"],
  ["letterhead", "Company letterhead"],
  ["tax_clearance", "Tax clearance (ITF263)"],
  ["praz", "PRAZ registration"],
  ["director_photo", "Director photo (selfie or passport photo)"],
  ["banking_proof", "Banking details / account confirmation letter"],
  ["other", "Other document"],
];

export function ComplianceDocs({ documents }: { documents: any[] }) {
  const [state, action, pending] = useActionState<VendorActionState, FormData>(
    uploadComplianceDoc,
    {},
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();

  return (
    <div>
      <h2 className="font-semibold text-ink-900">
        Business documents{" "}
        <Badge tone="blue" className="ml-1 align-middle">optional</Badge>
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">
        Completely optional — but adding your registration certificate, tax
        clearance or PRAZ number earns the{" "}
        <strong>Carguvi Verified</strong> badge faster, unlocks bigger payouts,
        and makes corporate buyers more likely to order from you.
      </p>

      <ul className="mt-3 space-y-1.5">
        {documents.map((d: any, i: number) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg border border-surface-200 px-3 py-2 text-sm"
          >
            <span className="text-ink-700">
              {DOC_TYPES.find(([k]) => k === d.type)?.[1] ?? d.type}
            </span>
            <a
              href={d.url}
              target="_blank"
              rel="noopener"
              className="tap text-xs font-medium text-brand-700"
            >
              View
            </a>
          </li>
        ))}
        {!documents.length ? (
          <li className="text-sm text-ink-400">No documents uploaded yet.</li>
        ) : null}
      </ul>

      <form action={action} className="mt-3 flex flex-col gap-3">
        <Field label="Document type">
          <Select name="doc_type" required>
            {DOC_TYPES.map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </Select>
        </Field>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="tap flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-300 px-4 py-3 text-sm font-medium text-ink-600 hover:border-brand-300 hover:text-brand-800"
        >
          {fileName ?? "Choose file (scan or photo)"}
        </button>
        <input
          ref={fileRef}
          type="file"
          name="document"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name)}
        />
        {state.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : state.ok ? (
          <p className="rounded-lg bg-trust-50 px-3 py-2 text-sm text-trust-700">
            Uploaded — thanks. Our team reviews it shortly.
          </p>
        ) : null}
        <Button type="submit" variant="outline" size="sm" className="self-start" disabled={pending}>
          {pending ? "Uploading…" : "Upload document"}
        </Button>
      </form>
    </div>
  );
}
