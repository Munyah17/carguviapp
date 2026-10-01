"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthFormState } from "../actions";
import { Input, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    {},
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">
        Save vehicles, order parts and track deliveries.
      </p>
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <Field label="Full name">
          <Input name="full_name" required autoComplete="name" />
        </Field>
        <Field label="Phone / WhatsApp" hint="Required — used for order updates and pickup coordination.">
          <Input name="phone" type="tel" required autoComplete="tel" placeholder="+263 77 000 0000" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Field>
        {state.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Creating accountâ€¦" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
