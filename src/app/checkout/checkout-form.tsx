"use client";

import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { IconPin, IconStore, IconTruck } from "@/components/ui/icons";

interface Group {
  vendorId: string;
  vendor: {
    business_name: string;
    vendor_locations: {
      id: string;
      name: string;
      address: string;
      area: string | null;
    }[];
  };
  items: { id: string; title: string; quantity: number; unit_price: number }[];
}

export function CheckoutForm({
  groups,
  addresses,
  subtotal,
  defaultName,
  defaultPhone,
  action,
}: {
  groups: Group[];
  addresses: any[];
  subtotal: number;
  defaultName?: string;
  defaultPhone?: string;
  action: (fd: FormData) => Promise<{ error?: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [needsAddress, setNeedsAddress] = useState(false);

  const flatDeliveryFee = 5.5; // quote is computed server-side; display estimate
  const anyDelivery = needsAddress;
  const estTotal = subtotal + (anyDelivery ? flatDeliveryFee * groups.length : 0);

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          const res = await action(fd);
          if (res?.error) setError(res.error);
        });
      }}
      className="mt-5 flex flex-col gap-6"
    >
      {/* Fulfilment per vendor */}
      {groups.map((g) => {
        const loc = g.vendor.vendor_locations?.[0];
        return (
          <section
            key={g.vendorId}
            className="rounded-xl border border-surface-200 bg-white"
          >
            <h2 className="border-b border-surface-200 px-4 py-3 text-sm font-semibold text-ink-900">
              {g.vendor.business_name}
            </h2>
            <ul className="divide-y divide-surface-100 px-4">
              {g.items.map((i) => (
                <li key={i.id} className="flex justify-between py-2.5 text-sm">
                  <span className="text-ink-700">
                    {i.quantity} × {i.title}
                  </span>
                  <span className="font-medium text-ink-900">
                    {formatPrice(i.unit_price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2 border-t border-surface-200 p-3">
              <label className="tap flex cursor-pointer items-start gap-2 rounded-lg border border-surface-300 p-3 has-checked:border-brand-500 has-checked:bg-brand-50">
                <input
                  type="radio"
                  name={`fulfilment_${g.vendorId}`}
                  value="pickup"
                  defaultChecked
                  className="mt-0.5"
                  onChange={() => setNeedsAddress(false)}
                />
                <span>
                  <span className="flex items-center gap-1 text-sm font-medium text-ink-900">
                    <IconStore className="h-4 w-4" /> Pickup
                  </span>
                  {loc ? (
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {loc.address}
                      {loc.area ? `, ${loc.area}` : ""}
                    </span>
                  ) : null}
                </span>
              </label>
              <label className="tap flex cursor-pointer items-start gap-2 rounded-lg border border-surface-300 p-3 has-checked:border-brand-500 has-checked:bg-brand-50">
                <input
                  type="radio"
                  name={`fulfilment_${g.vendorId}`}
                  value="delivery"
                  className="mt-0.5"
                  onChange={() => setNeedsAddress(true)}
                />
                <span>
                  <span className="flex items-center gap-1 text-sm font-medium text-ink-900">
                    <IconTruck className="h-4 w-4" /> Carguvi Delivery
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    Harare — within 40 km
                  </span>
                </span>
              </label>
            </div>
          </section>
        );
      })}

      {/* Contact — required so vendors can coordinate (guests too) */}
      <section className="rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink-900">Your details</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              Full name
            </span>
            <input
              name="guest_name"
              required
              defaultValue={defaultName}
              placeholder="e.g. Tendai Moyo"
              className="h-11 w-full rounded-lg border border-surface-300 px-3 text-base sm:text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              Phone / WhatsApp
            </span>
            <input
              name="guest_phone"
              required
              type="tel"
              defaultValue={defaultPhone}
              placeholder="e.g. 0772 000 000"
              className="h-11 w-full rounded-lg border border-surface-300 px-3 text-base sm:text-sm"
            />
          </label>
        </div>
      </section>

      {/* Delivery address */}
      <section className="rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <IconPin className="h-4 w-4 text-ink-400" /> Delivery address
        </h2>
        {addresses.length === 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-ink-500">
                Street address
              </span>
              <input
                name="addr_line1"
                placeholder="e.g. 14 Mbuya Nehanda Close"
                className="h-11 w-full rounded-lg border border-surface-300 px-3 text-base sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-500">
                Suburb / area
              </span>
              <input
                name="addr_area"
                placeholder="e.g. Borrowdale"
                className="h-11 w-full rounded-lg border border-surface-300 px-3 text-base sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-500">
                City
              </span>
              <input
                name="addr_city"
                defaultValue="Harare"
                className="h-11 w-full rounded-lg border border-surface-300 px-3 text-base sm:text-sm"
              />
            </label>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className="tap flex cursor-pointer items-start gap-2 rounded-lg border border-surface-300 p-3 has-checked:border-brand-500 has-checked:bg-brand-50"
              >
                <input
                  type="radio"
                  name="address_id"
                  value={a.id}
                  defaultChecked={a.is_default}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-medium text-ink-900">
                    {a.label ?? a.recipient_name ?? "Address"}
                  </span>
                  <span className="block text-ink-500">
                    {a.line1}, {a.area ? `${a.area}, ` : ""}
                    {a.city}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Payment */}
      <section className="rounded-xl border border-surface-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink-900">Payment method</h2>
        <div className="mt-2 space-y-2">
          {[
            ["ecocash", "EcoCash", "Pay from your EcoCash wallet"],
            ["zipit", "ZIPIT", "Instant bank transfer"],
            ["cash_on_pickup", "Cash on pickup", "Pay when you collect"],
          ].map(([value, label, hint]) => (
            <label
              key={value}
              className="tap flex cursor-pointer items-start gap-2 rounded-lg border border-surface-300 p-3 has-checked:border-brand-500 has-checked:bg-brand-50"
            >
              <input
                type="radio"
                name="payment_method"
                value={value}
                defaultChecked={value === "ecocash"}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium text-ink-900">
                  {label}
                </span>
                <span className="block text-xs text-ink-500">{hint}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Demo environment — payments are simulated by the configured provider.
        </p>
      </section>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {/* Summary */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-surface-200 bg-white p-4 sm:static sm:rounded-xl sm:border sm:p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-between text-sm text-ink-500">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-500">
            <span>Delivery</span>
            <span>
              {anyDelivery ? `~${formatPrice(flatDeliveryFee * groups.length)}` : "—"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-500">Total</p>
              <p className="text-lg font-bold text-ink-900">
                {formatPrice(estTotal)}
              </p>
            </div>
            <Button type="submit" size="lg" className="px-8" disabled={pending}>
              {pending ? "Placing order…" : "Place order"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
