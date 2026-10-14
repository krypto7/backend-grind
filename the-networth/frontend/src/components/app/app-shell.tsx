"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  CompassIcon,
  HouseIcon,
  MessageCircleIcon,
  SquarePenIcon,
  UserRoundIcon,
} from "lucide-react";
import { AccountAvatar, displayName } from "@/components/app/account-avatar";
import { Logo } from "@/components/auth/logo";
import { Spinner } from "@/components/ui/spinner";
import { loadAccount, type AccountUser } from "@/lib/api";
import { cn } from "@/lib/utils";

type AccountContextValue = {
  user: AccountUser | null;
  setUser: (user: AccountUser | null) => void;
};

const AccountContext = createContext<AccountContextValue>({
  user: null,
  setUser: () => {},
});

export function useAccount() {
  return useContext(AccountContext);
}

const links = [
  { href: "/home", label: "Home", icon: HouseIcon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/message", label: "Message", icon: MessageCircleIcon },
  { href: "/profile", label: "Profile", icon: UserRoundIcon },
];

const topics = ["Design", "Notes", "Cities", "Work"];

const people = [
  { username: "mira.cole", note: "Writes about product and type." },
  { username: "jonas.lee", note: "Keeps a short public notebook." },
  { username: "ada.nwosu", note: "Ships small interface details." },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const messagesOpen = pathname === "/message";
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loadAccount()
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
    <AccountContext.Provider value={{ user, setUser }}>
      <div className="mx-auto flex min-h-svh w-full max-w-[1280px]">
        <aside
          className={cn(
            "sticky top-0 hidden h-svh w-[88px] shrink-0 flex-col justify-between px-2 py-3 md:flex",
            !messagesOpen && "xl:w-[260px] xl:px-3",
          )}
        >
          <div>
            <div className="flex h-14 items-center px-3">
              <Logo nameClassName={messagesOpen ? "hidden" : "hidden xl:inline"} />
            </div>
            <nav className="mt-1 flex flex-col">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-label={link.label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-4 rounded-full px-3 py-3 text-xl transition-colors hover:bg-muted",
                      active
                        ? "font-semibold text-foreground"
                        : "text-foreground/80",
                    )}
                  >
                    <Icon className="size-6 shrink-0" />
                    <span className={cn("hidden", !messagesOpen && "xl:inline")}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/home"
              aria-label="Post"
              className={cn(
                "mt-4 grid size-12 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/80",
                !messagesOpen && "xl:mx-1 xl:h-12 xl:w-full",
              )}
            >
              <SquarePenIcon className={cn("size-5", !messagesOpen && "xl:hidden")} />
              <span className={cn("hidden", !messagesOpen && "xl:inline")}>
                Post
              </span>
            </Link>
          </div>
          {user ? (
            <Link
              href="/profile"
              aria-label="Your profile"
              className="flex items-center gap-3 rounded-full p-3 transition-colors hover:bg-muted"
            >
              <AccountAvatar user={user} className="size-10 shrink-0 text-sm" />
              <span className={cn("hidden min-w-0", !messagesOpen && "xl:block")}>
                <span className="block truncate text-sm font-semibold">
                  {displayName(user)}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  @{user.username}
                </span>
              </span>
            </Link>
          ) : null}
        </aside>

        <div className={cn("flex min-w-0 flex-1", !messagesOpen && "xl:flex-none")}>
          <main
            className={cn(
              "min-h-svh w-full min-w-0 border-x border-border px-4 py-4 pb-24 md:pb-4",
              messagesOpen && "flex flex-col",
              !messagesOpen && "xl:w-[600px] xl:max-w-[600px]",
            )}
          >
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

          {messagesOpen ? null : (
          <aside className="sticky top-0 hidden h-svh w-[350px] shrink-0 flex-col gap-4 overflow-y-auto px-6 py-3 xl:flex">
            <label className="sticky top-0 z-10 bg-background py-1">
              <span className="sr-only">Search</span>
              <input
                type="search"
                placeholder="Search"
                className="h-11 w-full rounded-full bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <section className="rounded-2xl bg-muted/70 p-4">
              <h2 className="font-serif text-xl">Topics</h2>
              <ul className="mt-3 grid gap-2">
                {topics.map((topic) => (
                  <li key={topic} className="text-sm font-medium">
                    {topic}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl bg-muted/70 p-4">
              <h2 className="font-serif text-xl">People</h2>
              <ul className="mt-3 grid gap-3">
                {people.map((person) => (
                  <li key={person.username}>
                    <p className="text-sm font-medium">@{person.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {person.note}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
          )}
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-background md:hidden">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 justify-center py-3",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-6" />
              </Link>
            );
          })}
        </nav>
      </div>
    </AccountContext.Provider>
  );
}
