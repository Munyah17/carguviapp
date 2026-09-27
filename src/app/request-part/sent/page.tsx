import Link from "next/link";
import { IconCheck } from "@/components/ui/icons";

export const metadata = { title: "Request received" };

export default function RequestSentPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-trust-50 text-trust-600">
        <IconCheck className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink-900">Request received</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        Our sourcing desk is on it. You&apos;ll get a quotation with price and
        delivery timeline <strong>within 48 hours</strong> — sourced from South
        Africa, Dubai or China, whichever is fastest for your part.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/search"
          className="tap rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white"
        >
          Keep browsing
        </Link>
        <Link
          href="/request-part"
          className="tap rounded-lg border border-surface-300 px-5 py-2.5 text-sm font-medium text-ink-700"
        >
          Request another part
        </Link>
      </div>
    </div>
  );
}
