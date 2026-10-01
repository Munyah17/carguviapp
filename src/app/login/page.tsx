import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { confirmed, error: urlError } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-500">
        Sign in to buy parts, track orders, manage your garage â€” or run your
        storefront.
      </p>
      {confirmed === "1" ? (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Email confirmed — sign in to continue.
        </p>
      ) : null}
      {urlError === "confirm" ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          That confirmation link is expired or invalid — sign up again or
          request a new link.
        </p>
      ) : null}
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
