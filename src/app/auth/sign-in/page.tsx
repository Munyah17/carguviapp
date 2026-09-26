"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthFormState } from "../actions";
import { Input, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SignInForm() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="hidden"
        name="next"
        value={searchParams.get("next") ?? ""}
      />
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password">
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-500">
        Sign in to buy parts, track orders and manage your garage.
      </p>
      <div className="mt-6">
        <Suspense>
          <SignInForm />
        </Suspense>
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
