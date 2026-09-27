"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const notConfigured = error.message.includes("Supabase is not configured");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <h1 className="text-xl font-bold text-ink-900">
        {notConfigured
          ? "Marketplace database not connected"
          : "Something went wrong"}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        {notConfigured
          ? "Carguvi's Supabase environment variables are not set on this deployment. Once configured, this page will show live marketplace data."
          : "We hit an unexpected error. Please try again."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="tap rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
        <Link
          href="/"
          className="tap rounded-lg border border-surface-300 px-5 py-2.5 text-sm font-medium text-ink-700"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
