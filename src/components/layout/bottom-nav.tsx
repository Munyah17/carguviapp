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

interface Props {
  isVendor?: boolean;
  isAdmin?: boolean;
  isEnumerator?: boolean;
  signedIn?: boolean;
}

export function BottomNav({ isVendor }: Props) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: IconHome },
    { href: "/search", label: "Search", icon: IconSearch },
    isVendor
      ? { href: "/vendor", label: "Shop", icon: IconStore }
      : { href: "/orders", label: "Orders", icon: IconPackage },
    { href: "/garage", label: "Garage", icon: IconCar },
    { href: "/account", label: "Account", icon: IconUser },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
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
