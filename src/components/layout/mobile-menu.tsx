"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { href: "/search", label: "Shop Parts" },
    { href: "/categories", label: "Categories" },
    { href: "/garage", label: "My Garage" },
    { href: "/request-part", label: "Request a Part" },
    { href: "/vendor/apply", label: "Sell on Carguvi" },
    { href: "/orders", label: "My Orders" },
    signedIn
      ? { href: "/account", label: "Account" }
      : { href: "/auth/sign-in", label: "Sign in" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="tap rounded-lg p-2 text-ink-700 hover:bg-surface-100 sm:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
              <span className="text-base font-bold text-ink-900">Carguvi</span>
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
            <nav className="p-2">
              {links.map((l) => (
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
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
