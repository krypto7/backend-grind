"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, authInputClass } from "@/components/auth/field";
import { PasswordInput } from "@/components/auth/password-input";
import { isEmail, isUsername } from "@/lib/auth-form";

type SignUpErrors = {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  avatar?: string;
};

export function SignUpForm() {
  const router = useRouter();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [errors, setErrors] = useState<SignUpErrors>({});

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function onAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);

    const nextPreview = file ? URL.createObjectURL(file) : null;
    previewRef.current = nextPreview;
    setFileName(file?.name ?? "");
    setPreview(nextPreview);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: SignUpErrors = {};

    if (!firstname.trim()) nextErrors.firstname = "Enter your first name.";
    if (!lastname.trim()) nextErrors.lastname = "Enter your last name.";

    if (!username.trim()) {
      nextErrors.username = "Choose a username.";
    } else if (!isUsername(username)) {
      nextErrors.username = "Use 3–20 letters, numbers, or underscores.";
    }

    if (!email.trim()) {
      nextErrors.email = "Enter your email.";
    } else if (!isEmail(email)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!password) {
      nextErrors.password = "Create a password.";
    } else if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!fileName) nextErrors.avatar = "Add a profile photo.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <div>
      <p className="text-sm font-medium text-primary">Get started</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
        Create your account
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        After this, we&apos;ll ask for the 6-digit code sent to your email.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstname" error={errors.firstname}>
            <Input
              id="firstname"
              name="firstname"
              autoComplete="given-name"
              placeholder="Alex"
              value={firstname}
              onChange={(event) => setFirstname(event.target.value)}
              aria-invalid={Boolean(errors.firstname)}
              className={authInputClass}
            />
          </Field>
          <Field label="Last name" htmlFor="lastname" error={errors.lastname}>
            <Input
              id="lastname"
              name="lastname"
              autoComplete="family-name"
              placeholder="Morgan"
              value={lastname}
              onChange={(event) => setLastname(event.target.value)}
              aria-invalid={Boolean(errors.lastname)}
              className={authInputClass}
            />
          </Field>
        </div>

        <Field
          label="Username"
          htmlFor="username"
          error={errors.username}
          hint={errors.username ? undefined : "3–20 letters, numbers, or underscores."}
        >
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="alexmorgan"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-invalid={Boolean(errors.username)}
            className={authInputClass}
          />
        </Field>

        <Field label="Email" htmlFor="signup-email" error={errors.email}>
          <Input
            id="signup-email"
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

        <Field label="Password" htmlFor="signup-password" error={errors.password}>
          <PasswordInput
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirm-password"
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
        </Field>

        <div className="grid gap-2">
          <label
            htmlFor="avatar"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-muted/50 px-3 py-3 transition-colors hover:bg-muted"
          >
            {preview ? (
              // Local preview of a file the user just picked. Not a remote image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="size-10 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10">
                <ImagePlusIcon className="size-4" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-sm font-medium">Profile photo</span>
              <span className="block truncate text-sm text-muted-foreground">
                {fileName || "JPG or PNG"}
              </span>
            </span>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onAvatarChange}
            />
          </label>
          {errors.avatar ? (
            <p className="text-sm text-destructive">{errors.avatar}</p>
          ) : null}
        </div>

        <Button type="submit" className="h-11 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
