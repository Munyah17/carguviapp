import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Admin sign in" };

/** Staff portal â€” admin + super_admin accounts only (role-checked server side). */
export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-14">
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
          Carguvi Staff
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink-900">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink-500">
          For Carguvi operations team members only.
        </p>
        <div className="mt-6">
          <SignInForm portal="admin" />
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-500">
        Not staff?{" "}
        <Link href="/login" className="font-medium text-brand-700">
          Customer sign in
        </Link>
      </p>
    </div>
  );
}
