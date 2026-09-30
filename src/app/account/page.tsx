import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles, getVendorForUser } from "@/lib/queries";
import { signOut } from "@/app/auth/actions";
import { IconChevronRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const roles = await getUserRoles(user.id);
  const vendorInfo = await getVendorForUser(user.id);

  const links: { href: string; label: string; hint?: string }[] = [
    { href: "/orders", label: "Orders", hint: "Track purchases" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/garage", label: "My Garage", hint: "Saved vehicles" },
    { href: "/account/addresses", label: "Addresses" },
    { href: "/notifications", label: "Notifications" },
    { href: "/inquiries", label: "Inquiries" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">
        {profile?.full_name || "My account"}
      </h1>
      <p className="text-sm text-ink-500">{user.email}</p>

      {/* Role dashboards */}
      <div className="mt-4 space-y-2">
        {vendorInfo ? (
          <Link
            href="/vendor"
            className="tap flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4"
          >
            <div>
              <p className="font-semibold text-brand-900">
                {vendorInfo.vendor.business_name}
              </p>
              <p className="text-xs text-brand-600">
                {vendorInfo.staffRole === "owner"
                  ? "Vendor dashboard"
                  : `Staff dashboard â€” ${vendorInfo.staffRole}`}
              </p>
            </div>
            <IconChevronRight className="h-5 w-5 text-brand-600" />
          </Link>
        ) : (
          <Link
            href="/vendor/apply"
            className="tap flex items-center justify-between rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-4"
          >
            <div>
              <p className="font-semibold text-brand-900">Sell on Carguvi</p>
              <p className="text-xs text-ink-500">
                Apply for a vendor storefront
              </p>
            </div>
            <IconChevronRight className="h-5 w-5 text-brand-600" />
          </Link>
        )}
        {roles.includes("enumerator") ? (
          <RoleLink href="/enumerator" label="Carguvi verification tasks" />
        ) : null}
        {roles.includes("admin") || roles.includes("super_admin") ? (
          <RoleLink href="/admin" label="Carguvi operations" />
        ) : null}
      </div>

      <nav className="mt-6 divide-y divide-surface-100 rounded-xl border border-surface-200 bg-white">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="tap flex items-center justify-between px-4 py-3.5"
          >
            <span>
              <span className="block text-sm font-medium text-ink-900">
                {l.label}
              </span>
              {l.hint ? (
                <span className="block text-xs text-ink-400">{l.hint}</span>
              ) : null}
            </span>
            <IconChevronRight className="h-4 w-4 text-ink-300" />
          </Link>
        ))}
      </nav>

      <form action={signOut} className="mt-6">
        <button className="tap w-full rounded-xl border border-surface-300 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
          Sign out
        </button>
      </form>
    </div>
  );
}

function RoleLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="tap flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4"
    >
      <p className="font-semibold text-ink-900">{label}</p>
      <IconChevronRight className="h-5 w-5 text-ink-400" />
    </Link>
  );
}
