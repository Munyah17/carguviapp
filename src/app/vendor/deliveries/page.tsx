import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendorForUser } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import {
  saveFleetVehicle,
  deleteFleetVehicle,
  dispatchDelivery,
  updateDelivery,
} from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Deliveries" };

const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "amber" },
  dispatched: { label: "Dispatched", tone: "blue" },
  picked_up: { label: "Picked up", tone: "blue" },
  in_transit: { label: "In transit", tone: "blue" },
  out_for_delivery: { label: "Out for delivery", tone: "blue" },
  delivered: { label: "Delivered", tone: "green" },
  failed: { label: "Failed", tone: "red" },
  returned: { label: "Returned", tone: "red" },
};

export default async function VendorDeliveriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/vendor/deliveries");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");
  const vendor = info.vendor;

  const [{ data: fleet }, { data: deliveries }, { data: deliverableOrders }] =
    await Promise.all([
      supabase
        .from("delivery_fleet")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("created_at"),
      supabase
        .from("deliveries")
        .select("*, delivery_fleet(label, driver_name, driver_phone)")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vendor_orders")
        .select("id, status, fulfillment_type, created_at")
        .eq("vendor_id", vendor.id)
        .eq("fulfillment_type", "delivery")
        .in("status", ["paid", "accepted", "preparing", "ready_for_pickup"])
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-12">
      <h1 className="text-xl font-bold text-ink-900">Deliveries</h1>
      <p className="mt-1 text-sm text-ink-500">
        Dispatch orders to your riders/drivers. Every vehicle must carry a GPS
        tracker — its device ID feeds live positions into the customer tracking
        page. If a tracker glitches, post a manual update.
      </p>

      {/* Fleet */}
      <section className="mt-6 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Fleet</h2>
        <ul className="mt-3 space-y-2">
          {(fleet ?? []).map((v: any) => (
            <li
              key={v.id}
              className="flex items-center justify-between rounded-lg border border-surface-200 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-ink-900">
                  {v.label}
                  {!v.is_active ? (
                    <Badge tone="red" className="ml-2">inactive</Badge>
                  ) : null}
                </p>
                <p className="text-xs text-ink-500">
                  {v.fleet_type}
                  {v.registration ? ` · ${v.registration}` : ""}
                  {v.driver_name ? ` · ${v.driver_name}` : ""}
                  {v.driver_phone ? ` · ${v.driver_phone}` : ""}
                  {v.tracker_device_id
                    ? ` · tracker ${v.tracker_device_id}`
                    : " · ⚠ no tracker"}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteFleetVehicle(v.id);
                }}
              >
                <button type="submit" className="text-xs text-red-600">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {!fleet?.length ? (
            <p className="text-sm text-ink-500">
              No vehicles yet — add your first rider or delivery car.
            </p>
          ) : null}
        </ul>
        <form
          action={saveFleetVehicle}
          className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-200 pt-4"
        >
          <Field label="Label">
            <Input name="label" required placeholder="Bike 1 — Tino" />
          </Field>
          <Field label="Type">
            <Select name="fleet_type" defaultValue="motorbike">
              <option value="motorbike">Motorbike</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="bicycle">Bicycle</option>
            </Select>
          </Field>
          <Field label="Registration">
            <Input name="registration" placeholder="Plate number" />
          </Field>
          <Field label="GPS tracker device ID" hint="IMEI or device ID from the tracker.">
            <Input name="tracker_device_id" placeholder="e.g. 3529…" />
          </Field>
          <Field label="Driver name">
            <Input name="driver_name" />
          </Field>
          <Field label="Driver phone">
            <Input name="driver_phone" type="tel" />
          </Field>
          <div className="col-span-2">
            <Button type="submit" variant="outline" size="sm">
              Add vehicle
            </Button>
          </div>
        </form>
      </section>

      {/* Active deliveries */}
      <section className="mt-6 rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Active deliveries</h2>
        <ul className="mt-3 space-y-3">
          {(deliveries ?? []).map((d: any) => {
            const s = STATUS[d.status] ?? STATUS.pending;
            return (
              <li
                key={d.id}
                className="rounded-lg border border-surface-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-semibold text-brand-800">
                      {d.tracking_code}
                    </p>
                    <p className="text-xs text-ink-500">
                      {d.delivery_fleet?.label ?? "No vehicle assigned"}
                      {d.delivery_fleet?.driver_name
                        ? ` · ${d.delivery_fleet.driver_name}`
                        : ""}
                      {d.destination_text ? ` → ${d.destination_text}` : ""}
                    </p>
                  </div>
                  <Badge tone={s.tone as any}>{s.label}</Badge>
                </div>
                <details className="mt-2">
                  <summary className="tap text-xs font-medium text-brand-700">
                    Update status / manual position
                  </summary>
                  <form
                    action={updateDelivery}
                    className="mt-2 grid grid-cols-2 gap-2"
                  >
                    <input type="hidden" name="delivery_id" value={d.id} />
                    <Field label="Status">
                      <Select name="status" defaultValue={d.status}>
                        {Object.entries(STATUS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="ETA">
                      <Input name="estimated_arrival" type="datetime-local" />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Current location (manual fallback)">
                        <Input
                          name="location_text"
                          placeholder="e.g. Rotten Row, near Joina City"
                        />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label="Note">
                        <Input name="note" placeholder="Optional note for customer" />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Button type="submit" size="sm" variant="outline">
                        Save update
                      </Button>
                    </div>
                  </form>
                </details>
              </li>
            );
          })}
          {!deliveries?.length ? (
            <p className="text-sm text-ink-500">No deliveries yet.</p>
          ) : null}
        </ul>
      </section>

      {/* Dispatch */}
      {deliverableOrders?.length ? (
        <section className="mt-6 rounded-xl border border-surface-200 bg-white p-4">
          <h2 className="font-semibold text-ink-900">Dispatch an order</h2>
          <ul className="mt-3 space-y-2">
            {deliverableOrders.map((o: any) => (
              <li
                key={o.id}
                className="rounded-lg border border-surface-200 p-3"
              >
                <form action={dispatchDelivery} className="grid grid-cols-2 gap-2">
                  <input type="hidden" name="vendor_order_id" value={o.id} />
                  <Field label="Vehicle">
                    <Select name="fleet_id">
                      <option value="">Unassigned</option>
                      {(fleet ?? []).map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Deliver to">
                    <Input name="destination_text" placeholder="Customer address" />
                  </Field>
                  <div className="col-span-2">
                    <Button type="submit" size="sm">
                      Create tracking code
                    </Button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
