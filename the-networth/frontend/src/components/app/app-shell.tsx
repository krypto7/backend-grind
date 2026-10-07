"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { AccountAvatar } from "@/components/app/account-avatar";
import { Logo } from "@/components/auth/logo";
import { Spinner } from "@/components/ui/spinner";
import { type AccountUser } from "@/lib/api";
import { restoreSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type AccountContextValue = {
  user: AccountUser | null;
};

const AccountContext = createContext<AccountContextValue>({ user: null });

export function useAccount() {
  return useContext(AccountContext);
}

const links = [
  { href: "/home", label: "Home" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    restoreSession()
      .then((account) => {
        if (!active) return;
        if (!account) {
          router.replace("/sign-in");
          return;
        }
        setUser(account);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <AccountContext.Provider value={{ user }}>
      <div className="min-h-svh">
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <Logo />
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1">
                {links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              {user ? (
                <Link
                  href="/profile"
                  aria-label="Your profile"
                  className="rounded-full ring-2 ring-transparent transition hover:ring-primary/20"
                >
                  <AccountAvatar user={user} className="size-8 text-xs" />
                </Link>
              ) : null}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          {loading || !user ? (
            <div
              role="status"
              className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground"
            >
              <Spinner className="size-6 text-primary" />
              Loading your account...
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </AccountContext.Provider>
  );
}
