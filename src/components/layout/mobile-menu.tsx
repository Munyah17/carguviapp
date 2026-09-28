"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  signedIn: boolean;
  isVendor?: boolean;
  isAdmin?: boolean;
  isEnumerator?: boolean;
}

export function MobileMenu({ signedIn, isVendor, isAdmin, isEnumerator }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sections: { title?: string; links: { href: string; label: string }[] }[] = [
    {
      title: "Shop",
      links: [
        { href: "/", label: "Home" },
        { href: "/search", label: "Shop parts" },
        { href: "/categories", label: "Categories" },
        { href: "/request-part", label: "Request a part (import)" },
        { href: "/cart", label: "Cart" },
      ],
    },
    {
      title: "Account",
      links: [
        { href: "/orders", label: "My orders" },
        { href: "/wishlist", label: "Wishlist" },
        { href: "/garage", label: "My vehicles" },
        { href: "/inquiries", label: "My inquiries" },
        { href: "/notifications", label: "Notifications" },
        { href: "/account", label: "Account details" },
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
          : { href: "/auth/sign-in", label: "Sign in" },
        { href: "/vendor/apply", label: "Sell on Carguvi" },
      ],
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="tap -ml-2 rounded-lg p-2 text-ink-700 hover:bg-surface-100 sm:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
              <span className="text-base font-bold text-brand-900">Carguvi</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="tap rounded-lg p-2 text-ink-500 hover:bg-surface-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {sections.map((section, si) => (
                <div key={si} className="mt-4 first:mt-0">
                  {section.title ? (
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                      {section.title}
                    </p>
                  ) : null}
                  {section.links.map((l) => (
                    <Link
                      key={l.href + l.label}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`tap block rounded-lg px-3 py-2.5 text-sm font-medium ${
                        pathname === l.href
                          ? "bg-brand-50 text-brand-800"
                          : "text-ink-700 hover:bg-surface-100"
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
