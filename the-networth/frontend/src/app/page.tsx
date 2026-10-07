"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { restoreSession } from "@/lib/session";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    restoreSession().then((user) => {
      if (!active) return;
      router.replace(user ? "/home" : "/sign-in");
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div
      role="status"
      className="flex min-h-svh flex-col items-center justify-center gap-3 text-sm text-muted-foreground"
    >
      <Spinner className="size-6 text-primary" />
      Checking your session...
    </div>
  );
}
