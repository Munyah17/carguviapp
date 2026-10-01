import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTrackingProvider } from "@/lib/services/tracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Track delivery" };

const STATUS_ORDER = [
  "pending",
  "dispatched",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "Preparing",
  dispatched: "Dispatched",
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
  returned: "Returned",
};

export default async function TrackPage({
  searchParams,
}: PageProps<"/track">) {
  const { code } = await searchParams;
  const trackingCode = (typeof code === "string" ? code : "")
    .trim()
    .toUpperCase();

  let delivery: any = null;
  let events: any[] = [];
  let livePosition: { latitude: number; longitude: number; recorded_at: string } | null = null;
  let trackerOffline = false;

  if (trackingCode) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("deliveries")
      .select(
        "*, vendor_orders(id, status), delivery_fleet(label, fleet_type, driver_name, tracker_device_id), vendors(business_name)",
      )
      .eq("tracking_code", trackingCode)
      .maybeSingle();
    delivery = data;

    if (delivery) {
      const { data: ev } = await supabase
        .from("delivery_events")
        .select("*")
        .eq("delivery_id", delivery.id)
        .order("created_at", { ascending: false })
        .limit(20);
      events = ev ?? [];

      // Live tracker pull — falls back silently when offline.
      const deviceId = delivery.delivery_fleet?.tracker_device_id;
      if (deviceId && !["delivered", "failed", "returned"].includes(delivery.status)) {
        const pos = await getTrackingProvider().fetchPosition(deviceId);
        if (pos) {
          livePosition = pos;
          // Persist tracker event so history survives (best-effort, admin client).
          const admin = createAdminClient();
          await admin.from("delivery_events").insert({
            delivery_id: delivery.id,
            latitude: pos.latitude,
            longitude: pos.longitude,
            source: "tracker",
          });
        } else {
          trackerOffline = true;
        }
      }
    }
  }

  const currentIdx = STATUS_ORDER.indexOf(delivery?.status as any);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-ink-900">Track your delivery</h1>
      <p className="mt-1 text-sm text-ink-500">
        Enter the tracking code your seller gave you (e.g. CGV-8F2K9Q).
      </p>
      <form className="mt-4 flex gap-2" method="GET" action="/track">
        <div className="flex-1">
          <Input
            name="code"
            defaultValue={trackingCode}
            placeholder="CGV-XXXXXX"
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="self-start">Track</Button>
      </form>

      {trackingCode && !delivery ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No delivery found for <strong>{trackingCode}</strong>. Check the code
          and try again.
        </p>
      ) : null}

      {delivery ? (
        <div className="mt-6 rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm font-semibold text-brand-800">
              {delivery.tracking_code}
            </p>
            <Badge tone={delivery.status === "delivered" ? "green" : "blue"}>
              {STATUS_LABEL[delivery.status] ?? delivery.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-600">
            {(delivery.vendors as any)?.business_name}
            {delivery.delivery_fleet?.label
              ? ` · ${delivery.delivery_fleet.label}`
              : ""}
            {delivery.destination_text
              ? ` → ${delivery.destination_text}`
              : ""}
          </p>
          {delivery.estimated_arrival ? (
            <p className="mt-1 text-xs text-ink-500">
              ETA: {new Date(delivery.estimated_arrival).toLocaleString()}
            </p>
          ) : null}

          {/* Progress */}
          <ol className="mt-4 space-y-2">
            {STATUS_ORDER.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    i <= currentIdx ? "bg-trust-500" : "bg-surface-200"
                  }`}
                />
                <span
                  className={
                    i <= currentIdx ? "font-medium text-ink-900" : "text-ink-400"
                  }
                >
                  {STATUS_LABEL[s]}
                </span>
              </li>
            ))}
          </ol>

          {/* Live position */}
          {livePosition ? (
            <p className="mt-4 rounded-lg bg-trust-50 px-3 py-2 text-xs text-trust-700">
              Live tracker position: {livePosition.latitude.toFixed(4)},{" "}
              {livePosition.longitude.toFixed(4)} ·{" "}
              {timeAgo(livePosition.recorded_at)}
            </p>
          ) : null}
          {trackerOffline ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Live tracker temporarily offline — showing dispatcher updates
              instead.
            </p>
          ) : null}

          {/* Event log */}
          {events.length ? (
            <div className="mt-4 border-t border-surface-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Updates
              </p>
              <ul className="mt-2 space-y-2">
                {events.map((e: any) => (
                  <li key={e.id} className="text-xs text-ink-600">
                    <span className="text-ink-400">{timeAgo(e.created_at)}</span>
                    {" — "}
                    {e.status ? `${STATUS_LABEL[e.status]} · ` : ""}
                    {e.location_text ??
                      (e.latitude
                        ? `${Number(e.latitude).toFixed(4)}, ${Number(e.longitude).toFixed(4)}`
                        : "")}
                    {e.note ? ` · ${e.note}` : ""}
                    {e.source === "manual" ? " (manual)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
