"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  IconCar,
  IconHome,
  IconPackage,
  IconSearch,
  IconStore,
  IconUser,
} from "@/components/ui/icons";

const baseItems = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/orders", label: "Orders", icon: IconPackage },
  { href: "/garage", label: "Garage", icon: IconCar },
];

export function BottomNav({ isVendor }: { isVendor?: boolean }) {
  const pathname = usePathname();
  const items = isVendor
    ? [
        baseItems[0],
        baseItems[1],
        { href: "/vendor", label: "Shop", icon: IconStore },
        baseItems[3],
        { href: "/account", label: "Account", icon: IconUser },
      ]
    : [...baseItems, { href: "/account", label: "Account", icon: IconUser }];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "tap flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                active ? "text-brand-700" : "text-ink-400",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
