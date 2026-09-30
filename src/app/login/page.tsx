import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-500">
        Sign in to buy parts, track orders, manage your garage â€” or run your
        storefront.
      </p>
      <div className="mt-6">
        <SignInForm portal="customer" />
      </div>
      <p className="mt-6 text-center text-sm text-ink-500">
        New to Carguvi?{" "}
        <Link href="/auth/register" className="font-medium text-brand-700">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-ink-500">
        Are you a parts business?{" "}
        <Link href="/vendor/apply" className="font-medium text-brand-700">
          Apply to sell on Carguvi
        </Link>
      </p>
    </div>
  );
}
