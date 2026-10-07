"use client";

import Link from "next/link";
import { ArrowRightIcon, BadgeCheckIcon } from "lucide-react";
import { AccountAvatar, displayName } from "@/components/app/account-avatar";
import { useAccount } from "@/components/app/app-shell";

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatJoined(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function HomeScreen() {
  const { user } = useAccount();
  if (!user) return null;

  const now = new Date();
  const name = displayName(user);
  const first = user.firstname.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const verified = user.isVerified !== false;
  const today = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const facts = [
    { label: "Email", value: user.email },
    { label: "Username", value: `@${user.username}` },
    { label: "Member since", value: formatJoined(user.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Home</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-balance sm:text-5xl">
            {greeting(now)}, {first}.
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      <section className="relative mt-8 overflow-hidden rounded-3xl bg-[#14241f] px-6 py-8 text-[#f6f3ec] sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-10 size-64 rounded-full bg-[#c4a574]/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            <AccountAvatar
              user={user}
              className="size-20 text-2xl ring-2 ring-[#c4a574]/40 sm:size-24"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.18em] text-[#c4a574] uppercase">
                Your account
              </p>
              <h2 className="mt-2 truncate font-serif text-3xl tracking-tight sm:text-4xl">
                {name}
              </h2>
              <p className="mt-1 truncate text-sm text-[#b7c4be]">
                @{user.username}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <p className="inline-flex items-center gap-2 text-sm text-[#d7e0db]">
              <BadgeCheckIcon className="size-4 text-[#c4a574]" />
              {verified ? "Email confirmed" : "Email not confirmed"}
            </p>
            <Link
              href="/profile"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#f6f3ec] px-4 text-sm font-medium text-[#14241f] transition-colors hover:bg-white"
            >
              View profile
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="rounded-2xl bg-card px-5 py-4 ring-1 ring-foreground/10"
          >
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {fact.label}
            </dt>
            <dd className="mt-2 truncate text-sm font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <section className="rounded-2xl bg-card px-6 py-6 ring-1 ring-foreground/10 sm:px-8">
          <p className="text-xs font-medium tracking-[0.18em] text-[#a68456] uppercase">
            This home
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight">
            Everything starts from here.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            You are signed in as {user.email}. Your name, photo, and email live
            on your profile, and you can leave this session from there.
          </p>
        </section>

        <Link
          href="/profile"
          className="group flex flex-col justify-between rounded-2xl bg-muted/70 px-6 py-6 ring-1 ring-foreground/10 transition-colors hover:bg-muted"
        >
          <span className="font-serif text-2xl tracking-tight">
            Open your profile
          </span>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium">
            Profile
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
