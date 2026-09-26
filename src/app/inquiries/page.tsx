import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inquiries" };

export default async function InquiriesPage({
  searchParams,
}: PageProps<"/inquiries">) {
  const { sent } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/inquiries");

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, vendors(business_name), products(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">Inquiries</h1>
        <ButtonLink href="/inquiries/new" size="sm" variant="outline">
          New inquiry
        </ButtonLink>
      </div>
      {sent ? (
        <p className="mt-3 rounded-lg bg-trust-50 px-3 py-2 text-sm text-trust-700">
          Inquiry sent — the vendor has been notified.
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {(inquiries ?? []).map((i: any) => (
          <li
            key={i.id}
            className="rounded-xl border border-surface-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink-900">
                {i.vendors?.business_name}
              </p>
              <Badge tone={i.status === "open" ? "amber" : "gray"}>
                {i.status}
              </Badge>
            </div>
            {i.products?.title ? (
              <p className="mt-0.5 text-xs text-ink-400">
                Re: {i.products.title}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-ink-700">{i.message}</p>
            <p className="mt-1 text-xs text-ink-400">{timeAgo(i.created_at)}</p>
          </li>
        ))}
      </ul>
      {!inquiries?.length ? (
        <p className="mt-8 text-center text-sm text-ink-500">
          No inquiries yet.
        </p>
      ) : null}
    </div>
  );
}
