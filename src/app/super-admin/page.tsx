import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Super admin" };

/** Super admin portal â€” super_admin role required, enforced in signIn. */
export default function SuperAdminPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-14">
      <div className="rounded-2xl border border-ink-900/10 bg-ink-900 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
          Restricted
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          Super admin sign in
        </h1>
        <p className="mt-1 text-sm text-ink-300">
          Platform owner access only. All sign-ins are logged.
        </p>
        <div className="mt-6 [&_input]:border-white/15 [&_input]:bg-white/10 [&_input]:text-white [&_label]:text-ink-300">
          <SignInForm portal="super" />
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-500">
        <Link href="/admin/login" className="font-medium text-brand-700">
          Admin sign in
        </Link>
      </p>
    </div>
  );
}
