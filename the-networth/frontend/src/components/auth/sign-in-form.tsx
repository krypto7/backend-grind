"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Field, authInputClass } from "@/components/auth/field";
import { PasswordInput } from "@/components/auth/password-input";
import { isEmail } from "@/lib/auth-form";
import { signinAPI } from "@/lib/api";

type SignInErrors = {
  email?: string;
  password?: string;
};

type SignInFormData = {
  email: string;
  password: string;
};

export function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignInFormData | null>(null);
  const [errors, setErrors] = useState<SignInErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = formData?.email ?? "";
    const password = formData?.password ?? "";
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
    setMessage("");
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signinAPI({ email: email.trim(), password });
      router.push("/home");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
      setIsSubmitting(false);
    }
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
            value={formData?.email ?? ""}
            onChange={(event) =>
              setFormData((current) => ({
                email: event.target.value,
                password: current?.password ?? "",
              }))
            }
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
            value={formData?.password ?? ""}
            onChange={(event) =>
              setFormData((current) => ({
                email: current?.email ?? "",
                password: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        {message ? (
          <p
            role="status"
            className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground"
          >
            {message}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? "Signing in..." : "Sign in"}
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
