import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveDispute } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Disputes" };

export default async function AdminDisputesPage() {
  const supabase = await createClient();
  const { data: disputes } = await supabase
    .from("disputes")
    .select("*, profiles:user_id(full_name, email), vendors(business_name), orders(id)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Disputes</h1>
      <ul className="mt-4 space-y-3">
        {(disputes ?? []).map((d: any) => (
          <li
            key={d.id}
            className="rounded-xl border border-surface-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold capitalize text-ink-900">
                  {d.dispute_type.replace(/_/g, " ")}
                </p>
                <p className="text-sm text-ink-500">
                  {d.profiles?.full_name ?? d.profiles?.email} ·{" "}
                  {d.vendors?.business_name ?? "—"} · {timeAgo(d.created_at)}
                </p>
              </div>
              <Badge
                tone={
                  d.status === "open"
                    ? "amber"
                    : d.status === "under_review"
                      ? "blue"
                      : "green"
                }
              >
                {d.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-ink-700">{d.description}</p>
            {d.resolution ? (
              <p className="mt-2 rounded-lg bg-surface-50 px-3 py-2 text-sm text-ink-700">
                Resolution: {d.resolution}
              </p>
            ) : null}
            {["open", "under_review"].includes(d.status) ? (
              <form
                action={resolveDispute}
                className="mt-3 flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="dispute_id" value={d.id} />
                <Select name="status" className="w-40" defaultValue="resolved">
                  <option value="under_review">Under review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
                <Input
                  name="resolution"
                  placeholder="Resolution note"
                  className="w-64"
                />
                <Button size="sm" type="submit" variant="outline">
                  Update
                </Button>
              </form>
            ) : null}
          </li>
        ))}
        {!disputes?.length ? (
          <p className="text-sm text-ink-500">No disputes.</p>
        ) : null}
      </ul>
    </div>
  );
}
