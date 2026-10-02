"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const RESEND_SECONDS = 30;

function formatTime(seconds: number) {
  return `0:${String(seconds).padStart(2, "0")}`;
}

export function VerifyOtpForm({ email }: { email: string }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      setAccepted(false);
      return;
    }

    setError("");
    setAccepted(true);
  }

  function onResend() {
    if (seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    setResent(true);
    setOtp("");
    setError("");
    setAccepted(false);
  }

  const shownEmail = email || "your email";

  if (accepted) {
    return (
      <div>
        <p className="text-sm font-medium text-primary">Code received</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
          That code is complete.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This page only checks that six digits were entered. It does not send
          them anywhere yet.
        </p>
        <Link
          href="/sign-in"
          className={cn(buttonVariants(), "mt-8 h-11 w-full")}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

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
              setAccepted(false);
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
            A new code would be sent here once email is connected.
          </p>
        ) : null}

        <Button type="submit" className="h-11 w-full">
          Verify
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-start gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onResend}
          disabled={seconds > 0}
          className="font-medium text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {seconds > 0 ? `Resend in ${formatTime(seconds)}` : "Resend code"}
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
