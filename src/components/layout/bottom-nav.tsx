"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  IconCar,
  IconHome,
  IconPackage,
  IconSearch,
  IconUser,
} from "@/components/ui/icons";

const items = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/orders", label: "Orders", icon: IconPackage },
  { href: "/garage", label: "Garage", icon: IconCar },
  { href: "/account", label: "Account", icon: IconUser },
];

export function BottomNav() {
  const pathname = usePathname();
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
