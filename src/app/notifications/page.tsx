import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import { IconBell } from "@/components/ui/icons";
import { markAllRead } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/notifications");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">Notifications</h1>
        {notifications?.some((n: any) => !n.read_at) ? (
          <form action={markAllRead}>
            <button className="tap text-sm font-medium text-brand-700">
              Mark all read
            </button>
          </form>
        ) : null}
      </div>
      {!notifications?.length ? (
        <div className="mt-8 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center">
          <IconBell className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 font-medium text-ink-700">No notifications</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-surface-100 rounded-xl border border-surface-200 bg-white">
          {notifications.map((n: any) => (
            <li
              key={n.id}
              className={cn(
                "px-4 py-3",
                !n.read_at && "bg-brand-50/50",
              )}
            >
              <div className="flex items-start gap-2">
                {!n.read_at ? (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                ) : (
                  <span className="mt-1.5 h-2 w-2 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-ink-900">{n.title}</p>
                  {n.body ? (
                    <p className="mt-0.5 text-sm text-ink-500">{n.body}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-ink-400">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
