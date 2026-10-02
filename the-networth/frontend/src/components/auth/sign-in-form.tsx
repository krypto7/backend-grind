"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, authInputClass } from "@/components/auth/field";
import { PasswordInput } from "@/components/auth/password-input";
import { isEmail } from "@/lib/auth-form";

type SignInErrors = {
  email?: string;
  password?: string;
};

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignInErrors>({});
  const [ready, setReady] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: SignInErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Enter your email.";
    } else if (!isEmail(email)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);
    setReady(Object.keys(nextErrors).length === 0);
  }

  return (
    <div>
      <p className="text-sm font-medium text-primary">Welcome back</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
        Sign in to your account
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Use the email and password for your account.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            className={authInputClass}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        {ready ? (
          <p className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
            Details look fine. Sign-in is not connected yet.
          </p>
        ) : null}

        <Button type="submit" className="h-11 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
