import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatPrice, timeAgo } from "@/lib/format";
import { updateSourcingRequest } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sourcing requests — Admin" };

const STATUS: Record<string, { label: string; tone: string }> = {
  requested: { label: "Requested", tone: "amber" },
  quoting: { label: "Quoting", tone: "amber" },
  quoted: { label: "Quoted", tone: "blue" },
  accepted: { label: "Accepted", tone: "green" },
  ordered: { label: "Ordered", tone: "blue" },
  in_transit: { label: "In transit", tone: "blue" },
  arrived: { label: "Arrived", tone: "green" },
  completed: { label: "Completed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

const SOURCE_LABEL: Record<string, string> = {
  south_africa: "South Africa (3–14d)",
  dubai: "Dubai (7–21d)",
  china: "China (4–12wk)",
  japan: "Japan (4–12wk)",
  any: "Fastest",
};

export default async function AdminSourcingPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("sourcing_requests")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Sourcing requests</h1>
      <p className="mt-1 text-sm text-ink-500">
        Custom import requests — respond within 48h with a quotation and
        timeline.
      </p>

      <ul className="mt-5 space-y-3">
        {(requests ?? []).map((r: any) => {
          const s = STATUS[r.status] ?? STATUS.requested;
          return (
            <li
              key={r.id}
              className="rounded-xl border border-surface-200 bg-white"
            >
              <details className="group">
                <summary className="tap flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-900">
                      {r.part_name}
                      {r.quantity > 1 ? ` ×${r.quantity}` : ""}
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      {r.name ?? (r.profiles as any)?.full_name ?? "Anonymous"} ·{" "}
                      {r.contact} · {timeAgo(r.created_at)}
                      {r.vehicle_description ? ` · ${r.vehicle_description}` : ""}
                    </p>
                  </div>
                  {r.quote_amount ? (
                    <span className="text-sm font-semibold text-ink-900">
                      {formatPrice(r.quote_amount, r.currency)}
                    </span>
                  ) : null}
                  <Badge tone={s.tone as any}>{s.label}</Badge>
                </summary>
                <div className="border-t border-surface-100 p-4">
                  <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-ink-400">Condition</dt>
                      <dd className="capitalize text-ink-700">
                        {r.condition_pref}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-400">Source</dt>
                      <dd className="text-ink-700">
                        {SOURCE_LABEL[r.source_pref ?? "any"]}
                      </dd>
                    </div>
                    {r.part_number ? (
                      <div>
                        <dt className="text-xs text-ink-400">Part no.</dt>
                        <dd className="text-ink-700">{r.part_number}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {r.notes ? (
                    <p className="mt-2 rounded-lg bg-surface-50 p-2 text-sm text-ink-600">
                      {r.notes}
                    </p>
                  ) : null}
                  {r.vehicle_photo_url || r.part_photo_url ? (
                    <div className="mt-2 flex gap-2">
                      {[r.vehicle_photo_url, r.part_photo_url]
                        .filter(Boolean)
                        .map((url: string) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener"
                            className="tap"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="Request photo"
                              className="h-20 w-20 rounded-lg border border-surface-200 object-cover"
                            />
                          </a>
                        ))}
                    </div>
                  ) : null}

                  <form
                    action={updateSourcingRequest}
                    className="mt-4 grid grid-cols-2 gap-3"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <Field label="Status">
                      <Select name="status" defaultValue={r.status}>
                        {Object.entries(STATUS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Quote (USD)">
                      <Input
                        name="quote_amount"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={r.quote_amount ?? ""}
                      />
                    </Field>
                    <div className="col-span-2">
                      <Field
                        label="Timeline"
                        hint="e.g. 10–14 days, from Dubai"
                      >
                        <Input
                          name="quote_timeline"
                          defaultValue={r.quote_timeline ?? ""}
                        />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label="Notes to customer">
                        <Textarea
                          name="admin_notes"
                          rows={2}
                          defaultValue={r.admin_notes ?? ""}
                        />
                      </Field>
                    </div>
                    <input type="hidden" name="currency" value="USD" />
                    <div className="col-span-2">
                      <Button type="submit">Save & notify</Button>
                    </div>
                  </form>
                </div>
              </details>
            </li>
          );
        })}
        {!requests?.length ? (
          <p className="rounded-xl border border-surface-200 bg-white p-6 text-center text-sm text-ink-400">
            No sourcing requests yet.
          </p>
        ) : null}
      </ul>
    </div>
  );
}
