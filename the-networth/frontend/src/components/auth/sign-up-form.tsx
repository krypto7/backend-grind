"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Field, authInputClass } from "@/components/auth/field";
import { PasswordInput } from "@/components/auth/password-input";
import { isEmail, isUsername } from "@/lib/auth-form";
import { signupAPI } from "@/lib/api";

type SignUpErrors = {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  avtar?: string;
};

export function SignUpForm() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    avtar: null as File | null,
  });

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    console.log(formData);
  };

  function onavtarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);

    const nextPreview = file ? URL.createObjectURL(file) : null;
    previewRef.current = nextPreview;
    setFileName(file?.name ?? "");
    setPreview(nextPreview);

    setFormData((prev) => ({ ...prev, avtar: file }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: SignUpErrors = {};

    if (!formData.firstname.trim())
      nextErrors.firstname = "Enter your first name.";
    if (!formData.lastname.trim())
      nextErrors.lastname = "Enter your last name.";

    if (!formData.username.trim()) {
      nextErrors.username = "Choose a username.";
    } else if (!isUsername(formData.username)) {
      nextErrors.username = "Use 3–20 letters, numbers, or underscores.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Enter your email.";
    } else if (!isEmail(formData.email)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!formData.password) {
      nextErrors.password = "Create a password.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (!fileName) nextErrors.avtar = "Add a profile photo.";

    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    //create API payload:
    const payload = new FormData();

    payload.append("firstname", formData.firstname);
    payload.append("lastname", formData.lastname);
    payload.append("username", formData.username);
    payload.append("email", formData.email);
    payload.append("password", formData.password);

    if (formData.avtar) {
      payload.append("avtar", formData.avtar);
    }

    console.log("Payload:", payload);

    try {
      const data = await signupAPI(payload);
      console.log("Signup successful:", data);

      const expires = data.user?.otpExpiry
        ? `&expires=${encodeURIComponent(data.user.otpExpiry)}`
        : "";

      router.push(
        `/verify-otp?email=${encodeURIComponent(formData.email.trim())}${expires}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to sign up.",
      );
      setIsSubmitting(false);
    }
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
          <Field
            label="First name"
            htmlFor="firstname"
            error={errors.firstname}
          >
            <Input
              id="firstname"
              name="firstname"
              autoComplete="given-name"
              placeholder="Alex"
              value={formData.firstname}
              onChange={handleChange}
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
              value={formData.lastname}
              onChange={handleChange}
              aria-invalid={Boolean(errors.lastname)}
              className={authInputClass}
            />
          </Field>
        </div>

        <Field
          label="Username"
          htmlFor="username"
          error={errors.username}
          hint={
            errors.username
              ? undefined
              : "3–20 letters, numbers, or underscores."
          }
        >
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="alexmorgan"
            value={formData.username}
            onChange={handleChange}
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
            value={formData.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            className={authInputClass}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="signup-password"
          error={errors.password}
        >
          <PasswordInput
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        <div className="grid gap-2">
          <label
            htmlFor="avtar"
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
              id="avtar"
              name="avtar"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onavtarChange}
            />
          </label>
          {errors.avtar ? (
            <p className="text-sm text-destructive">{errors.avtar}</p>
          ) : null}
        </div>

        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? "Creating account..." : "Create account"}
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
