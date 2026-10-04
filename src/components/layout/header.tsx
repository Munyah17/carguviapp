import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserRoles } from "@/lib/queries";
import { isGuest } from "@/lib/guest";
import { IconCart } from "@/components/ui/icons";
import { MobileMenu } from "./mobile-menu";

export function Logo({ className = "h-7" }: { className?: string }) {
  return (
    <Link href="/" className={`tap flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect width="32" height="32" rx="7" className="fill-brand-700" />
        <path
          d="M8 20.5 11.5 11h3l1.8 5h3.4l1.8-5h3L21 20.5h-3.2l-1.8-5h-3l-1.8 5H8Z"
          className="fill-white"
        />
      </svg>
      <span className="text-lg font-bold tracking-tight text-brand-900">
        Carguvi
      </span>
    </Link>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Shop Parts" },
  { href: "/request-part", label: "Request a Part" },
  { href: "/vendor/apply", label: "Sell on Carguvi" },
];

export async function Header() {
  let user = null;
  let roles: string[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      roles = await getUserRoles(user.id);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <MobileMenu
          signedIn={!!user && !isGuest(user)}
          isVendor={roles.includes("vendor")}
          isAdmin={roles.includes("admin") || roles.includes("super_admin")}
          isEnumerator={roles.includes("enumerator")}
        />
        <span className="hidden sm:block">
          <Logo />
        </span>
        <div className="ml-auto flex items-center gap-1">
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="tap rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-surface-100 hover:text-ink-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/cart"
            className="tap rounded-lg p-2 text-ink-700 hover:bg-surface-100"
            aria-label="Cart"
          >
            <IconCart className="h-5 w-5" />
          </Link>
          <Link
            href={user && !isGuest(user) ? "/account" : "/login"}
            className="tap hidden rounded-lg border border-surface-300 px-3.5 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 sm:ml-2 sm:block"
          >
            {user && !isGuest(user) ? "Account" : "Sign in"}
          </Link>
          {!user || isGuest(user) ? (
            <Link
              href="/auth/register"
              className="tap ml-1 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 sm:ml-4 sm:px-5 sm:py-2.5 sm:text-base"
            >
              Get Started
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
