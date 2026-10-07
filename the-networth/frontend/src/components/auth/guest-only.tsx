"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { restoreSession } from "@/lib/session";

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    restoreSession().then((user) => {
      if (!active) return;
      if (user) {
        router.replace("/home");
        return;
      }
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div
        role="status"
        className="flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-muted-foreground"
      >
        <Spinner className="size-6 text-primary" />
        Checking your session...
      </div>
    );
  }

  return children;
}
