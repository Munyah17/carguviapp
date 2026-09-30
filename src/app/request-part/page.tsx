import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { RequestForm } from "./request-form";

export const metadata = {
  title: "Request a part — custom import",
  description:
    "Can't find it locally? Carguvi imports parts from South Africa, Dubai and China. Quotation and timeline within 48 hours.",
};

export default async function RequestPartPage({
  searchParams,
}: PageProps<"/request-part">) {
  const { part } = await searchParams;
  let user = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold text-ink-900">
        Can&apos;t find it? We&apos;ll source it.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        Tell us the part you need. Carguvi imports from{" "}
        <strong>South Africa</strong>, <strong>Dubai</strong>,{" "}
        <strong>China</strong> and <strong>Japan</strong> — we&apos;ll come back
        to you with a quotation and delivery timeline{" "}
        <strong>within 48 hours</strong>.
      </p>

      <div className="mt-5 rounded-2xl border border-surface-200 bg-white p-5">
        <RequestForm
          prefillPart={typeof part === "string" ? part : ""}
          signedIn={!!user}
        />
      </div>

      <ul className="mt-5 space-y-2 text-sm text-ink-500">
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
          Genuine and aftermarket options — specify if you need OEM quality.
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
          Pay only after you accept our quotation — no obligations, no account
          needed.
        </li>
      </ul>
      <div className="mt-4 rounded-xl border border-surface-200 bg-white p-4">
        <p className="text-sm font-semibold text-ink-900">
          Estimated delivery timelines
        </p>
        <ul className="mt-2 space-y-1 text-sm text-ink-600">
          <li>South Africa — 3–14 days</li>
          <li>Dubai — 7–21 days</li>
          <li>China — 4–12 weeks</li>
          <li>Japan — 4–12 weeks</li>
        </ul>
      </div>
    </div>
  );
}
