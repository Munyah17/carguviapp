"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function AdminNav({ isSuper }: { isSuper: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Overview", exact: true },
    { href: "/admin/vendors", label: "Vendors" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/verification", label: "Verification" },
    { href: "/admin/disputes", label: "Disputes" },
    { href: "/admin/orders", label: "Orders" },
    ...(isSuper ? [{ href: "/admin/system", label: "System" }] : []),
  ];
  return (
    <div className="sticky top-14 z-30 border-b border-surface-200 bg-white/95 backdrop-blur">
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
