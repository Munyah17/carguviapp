"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthFormState } from "@/app/auth/actions";
import { Input, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Shared sign-in form. `portal` controls role gating:
 *   "customer" — public buyers/vendors (default)
 *   "admin"    — requires admin or super_admin role
 *   "super"    — requires super_admin role
 */
function Form({ portal }: { portal: "customer" | "admin" | "super" }) {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="portal" value={portal} />
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

export function SignInForm({
  portal = "customer",
}: {
  portal?: "customer" | "admin" | "super";
}) {
  return (
    <Suspense>
      <Form portal={portal} />
    </Suspense>
  );
}
