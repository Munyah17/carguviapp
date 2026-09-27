"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

function MenuIcon(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={p.className} aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

export function BottomNav({ isVendor, isAdmin, isEnumerator, signedIn }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock scroll while drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const barItems = [
    { href: "/", label: "Home", icon: IconHome },
    { href: "/search", label: "Search", icon: IconSearch },
    isVendor
      ? { href: "/vendor", label: "Shop", icon: IconStore }
      : { href: "/orders", label: "Orders", icon: IconPackage },
    { href: "/garage", label: "Garage", icon: IconCar },
  ];

  const drawerSections: { title?: string; links: { href: string; label: string }[] }[] = [
    {
      title: "Shop",
      links: [
        { href: "/search", label: "Search parts" },
        { href: "/categories", label: "Browse categories" },
        { href: "/cart", label: "Cart" },
        { href: "/orders", label: "My orders" },
        { href: "/wishlist", label: "Wishlist" },
        { href: "/inquiries", label: "My inquiries" },
        { href: "/request-part", label: "Request a part (import)" },
      ],
    },
    {
      title: "My account",
      links: [
        { href: "/garage", label: "My vehicles" },
        { href: "/account", label: "Account details" },
        { href: "/account/addresses", label: "Addresses" },
        { href: "/notifications", label: "Notifications" },
        { href: "/disputes/new", label: "Report a problem" },
      ],
    },
    ...(isVendor
      ? [{
          title: "Vendor",
          links: [
            { href: "/vendor", label: "Dashboard" },
            { href: "/vendor/products", label: "Products" },
            { href: "/vendor/orders", label: "Orders" },
            { href: "/vendor/confirmations", label: "Confirmations" },
            { href: "/vendor/staff", label: "Staff" },
            { href: "/vendor/settings", label: "Settings" },
          ],
        }]
      : []),
    ...(isEnumerator
      ? [{ title: "Field work", links: [{ href: "/enumerator", label: "Verification tasks" }] }]
      : []),
    ...(isAdmin
      ? [{ title: "Operations", links: [{ href: "/admin", label: "Admin console" }] }]
      : []),
    {
      links: [
        signedIn
          ? { href: "/account", label: "Sign out (account page)" }
          : { href: "/auth/sign-in", label: "Sign in / Register" },
        { href: "/vendor/apply", label: "Sell on Carguvi" },
      ],
    },
  ];

  return (
    <>
      {/* Bottom bar — always above the browser chrome via safe-area padding */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          {barItems.map(({ href, label, icon: Icon }) => {
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
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className={cn(
              "tap flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              open ? "text-brand-700" : "text-ink-400",
            )}
          >
            <MenuIcon className="h-5 w-5" />
            Menu
          </button>
        </div>
      </nav>

      {/* Drawer */}
      {open ? (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-surface-100 bg-white px-4 pb-2 pt-3">
              <span className="mx-auto -mt-1 mb-1 block h-1 w-10 rounded-full bg-surface-300 sm:hidden" />
            </div>
            <div className="px-4 pb-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-base font-bold text-ink-900">Menu</p>
                <button
                  onClick={() => setOpen(false)}
                  className="tap rounded-lg px-3 py-1.5 text-sm font-medium text-ink-500"
                >
                  Close
                </button>
              </div>
              {drawerSections.map((section, si) => (
                <div key={si} className="mt-3 first:mt-0">
                  {section.title ? (
                    <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {section.title}
                    </p>
                  ) : null}
                  <div className="grid grid-cols-2 gap-1">
                    {section.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="tap rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-100"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
