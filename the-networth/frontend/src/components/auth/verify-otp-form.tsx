"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { resendOTP, verifyOTP } from "@/lib/api";

function secondsUntil(expiry?: string | null) {
  if (!expiry) return 0;
  const remaining = new Date(expiry).getTime() - Date.now();
  if (Number.isNaN(remaining)) return 0;
  return Math.max(0, Math.floor(remaining / 1000));
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function VerifyOtpForm({
  email,
  expiresAt: initialExpiresAt,
}: {
  email: string;
  expiresAt: string;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [seconds, setSeconds] = useState(() => secondsUntil(initialExpiresAt));
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds(secondsUntil(expiresAt));
    }, 1000);

    return () => window.clearInterval(id);
  }, [expiresAt]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    if (!email) {
      setError("Go back and enter the email used to sign up.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await verifyOTP(email, otp);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify OTP.");
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (seconds > 0 || resending || !email) return;

    setResending(true);
    setError("");

    try {
      const data = await resendOTP(email);
      setExpiresAt(data.otpExpiry);
      setSeconds(secondsUntil(data.otpExpiry));
      setResent(true);
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  }

  const shownEmail = email || "your email";

  return (
    <div>
      <p className="text-sm font-medium text-primary">Email verification</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
        Enter your code
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">{shownEmail}</span>. It
        expires in 10 minutes.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
            autoComplete="one-time-code"
            containerClassName="justify-start gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-10 text-base sm:size-12" />
              <InputOTPSlot index={1} className="size-10 text-base sm:size-12" />
              <InputOTPSlot index={2} className="size-10 text-base sm:size-12" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="size-10 text-base sm:size-12" />
              <InputOTPSlot index={4} className="size-10 text-base sm:size-12" />
              <InputOTPSlot index={5} className="size-10 text-base sm:size-12" />
            </InputOTPGroup>
          </InputOTP>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        {resent ? (
          <p className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
            A new code was sent to your email.
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={submitting || resending}
          aria-busy={submitting}
        >
          {submitting ? <Spinner /> : null}
          {submitting ? "Verifying..." : "Verify"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-start gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onResend}
          disabled={seconds > 0 || resending || submitting}
          aria-busy={resending}
          className="inline-flex items-center font-medium text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {resending ? <Spinner className="mr-1.5 inline size-3.5" /> : null}
          {seconds > 0
            ? `Resend in ${formatTime(seconds)}`
            : resending
              ? "Sending..."
              : "Resend code"}
        </button>
        <Link
          href="/sign-up"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Use a different email
        </Link>
      </div>
    </div>
  );
}
