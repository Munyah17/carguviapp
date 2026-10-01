"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/vendor", label: "Dashboard", exact: true },
  { href: "/vendor/products", label: "Products" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/deliveries", label: "Deliveries" },
  { href: "/vendor/confirmations", label: "Confirmations" },
  { href: "/vendor/staff", label: "Staff" },
  { href: "/vendor/settings", label: "Settings" },
];

export function VendorNav() {
  const pathname = usePathname();
  if (pathname === "/vendor/apply") return null;
  return (
    <div className="sticky top-14 z-30 border-b border-surface-200 bg-white/95 backdrop-blur sm:top-14">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {items.map((i) => {
          const active = i.exact
            ? pathname === i.href
            : pathname.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "tap whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium",
                active
                  ? "border-brand-700 text-brand-800"
                  : "border-transparent text-ink-500 hover:text-ink-700",
              )}
            >
              {i.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
