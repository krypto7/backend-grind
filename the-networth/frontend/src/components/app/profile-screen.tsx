"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, PencilIcon } from "lucide-react";
import { AccountAvatar, displayName } from "@/components/app/account-avatar";
import { EditProfileDialog } from "@/components/app/edit-profile-dialog";
import { useAccount } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { logoutAPI } from "@/lib/api";

export function ProfileScreen() {
  const { user, setUser } = useAccount();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const name = displayName(user);

  async function onLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logoutAPI();
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log out.");
      setLoggingOut(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-primary">Profile</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-balance sm:text-5xl">
        Your account
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
        This is the first stop after you create an account. Review your details,
        then log out when you are done.
      </p>

      <section className="mt-10 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="h-28 bg-[#14241f] sm:h-36" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <AccountAvatar
            user={user}
            className="-mt-12 size-24 text-2xl ring-4 ring-card sm:-mt-14 sm:size-28"
          />
          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-serif text-3xl tracking-tight">{name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Edit profile"
              onClick={() => setEditing(true)}
            >
              <PencilIcon />
            </Button>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/70 px-4 py-3">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium break-all">
                {user.email}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/70 px-4 py-3">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Status
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {user.isVerified === false ? "Email not confirmed" : "Verified"}
              </dd>
            </div>
          </dl>

          {error ? (
            <p className="mt-6 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            variant="destructive"
            className="mt-8 h-11 px-4"
            onClick={onLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
          >
            {loggingOut ? <Spinner /> : <LogOutIcon />}
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </section>

      <EditProfileDialog
        user={user}
        open={editing}
        onOpenChange={setEditing}
        onSaved={setUser}
      />
    </div>
  );
}
