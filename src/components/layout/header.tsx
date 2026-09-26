import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IconCart, IconSearch, IconUser } from "@/components/ui/icons";

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

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Logo />
        <Link
          href="/search"
          className="tap hidden h-10 flex-1 items-center gap-2 rounded-lg border border-surface-300 bg-surface-50 px-3 text-sm text-ink-400 sm:flex sm:max-w-md"
        >
          <IconSearch className="h-4 w-4" />
          What part are you looking for?
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/cart"
            className="tap rounded-lg p-2 text-ink-700 hover:bg-surface-100"
            aria-label="Cart"
          >
            <IconCart className="h-5 w-5" />
          </Link>
          <Link
            href={user ? "/account" : "/auth/sign-in"}
            className="tap flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-ink-700 hover:bg-surface-100"
          >
            <IconUser className="h-5 w-5" />
            <span className="hidden sm:inline">
              {user ? "Account" : "Sign in"}
            </span>
          </Link>
        </div>
      </div>
      {/* Mobile search row */}
      <div className="px-4 pb-3 sm:hidden">
        <Link
          href="/search"
          className="tap flex h-11 items-center gap-2 rounded-lg border border-surface-300 bg-surface-50 px-3 text-sm text-ink-400"
        >
          <IconSearch className="h-4 w-4" />
          What part are you looking for?
        </Link>
      </div>
    </header>
  );
}
