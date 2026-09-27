import Link from "next/link";
import { Logo } from "./header";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/search", label: "Search parts" },
      { href: "/categories", label: "All categories" },
      { href: "/garage", label: "My garage" },
      { href: "/inquiries/new", label: "Request a part" },
    ],
  },
  {
    title: "Sell",
    links: [
      { href: "/vendor/apply", label: "Become a vendor" },
      { href: "/vendor", label: "Vendor dashboard" },
      { href: "/vendor/confirmations", label: "Confirm stock" },
    ],
  },
  {
    title: "Your orders",
    links: [
      { href: "/orders", label: "Track orders" },
      { href: "/cart", label: "Cart" },
      { href: "/disputes/new", label: "Report a problem" },
      { href: "/inquiries", label: "Inquiries" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "Account details" },
      { href: "/account/addresses", label: "Addresses" },
      { href: "/notifications", label: "Notifications" },
      { href: "/auth/sign-in", label: "Sign in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
                <rect width="32" height="32" rx="7" className="fill-brand-600" />
                <path
                  d="M8 20.5 11.5 11h3l1.8 5h3.4l1.8-5h3L21 20.5h-3.2l-1.8-5h-3l-1.8 5H8Z"
                  className="fill-white"
                />
              </svg>
              <span className="text-lg font-bold text-white">Carguvi</span>
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-400">
              Zimbabwe&apos;s vehicle-parts marketplace. Verified stock from
              Kaguvi Street vendors, delivered across Harare.
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-trust-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12 2l8 3v6c0 5-3.5 9.3-8 11-4.5-1.7-8-6-8-11V5l8-3z"/></svg>
              Availability confirmed by field agents
            </p>
          </div>
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="tap text-sm text-ink-300 hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-ink-800 pt-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="https://globalspaceweb.co.zw"
            target="_blank"
            rel="noopener noreferrer"
            className="tap hover:text-white"
          >
            © {new Date().getFullYear()} Carguvi. Harare, Zimbabwe. Developed
            and Powered By Global Space Web.
          </a>
          <p>Parts, verified.</p>
        </div>
      </div>
    </footer>
  );
}
