"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, PencilIcon } from "lucide-react";
import { AccountAvatar, displayName } from "@/components/app/account-avatar";
import { EditProfileDialog } from "@/components/app/edit-profile-dialog";
import { useAccount } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  getUserPostAPI,
  logoutAPI,
  type Post,
  type PostMedia,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import Posts from "./posts";

function PostPhotos({ media }: { media?: PostMedia[] }) {
  const photos = (media ?? []).filter((item) => item.mediaUrl);
  if (photos.length === 0) return null;

  return (
    <div className={cn("mt-3 grid gap-2", photos.length > 1 && "grid-cols-2")}>
      {photos.map((item, index) =>
        item.mediaType === "video" ? (
          <video
            key={item.publicId ?? item.mediaUrl}
            src={item.mediaUrl ?? ""}
            controls
            className={cn(
              "w-full rounded-xl bg-[#14241f] ring-1 ring-foreground/10",
              photos.length === 1 && "max-h-96",
              photos.length > 1 && "aspect-square object-cover",
              photos.length === 3 && index === 0 && "col-span-2 aspect-[2/1]",
            )}
          />
        ) : (
          // Photos are stored on Cloudinary.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.publicId ?? item.mediaUrl}
            src={item.mediaUrl ?? ""}
            alt=""
            className={cn(
              "w-full rounded-xl object-cover ring-1 ring-foreground/10",
              photos.length === 1 && "max-h-96",
              photos.length > 1 && "aspect-square",
              photos.length === 3 && index === 0 && "col-span-2 aspect-[2/1]",
            )}
          />
        ),
      )}
    </div>
  );
}

export function ProfileScreen() {
  const { user, setUser } = useAccount();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    let active = true;

    getUserPostAPI(user._id)
      .then((userPosts) => {
        if (active) setPosts(userPosts);
      })
      .catch(() => {
        if (active) setError("Unable to load your posts.");
      })
      .finally(() => {
        if (active) setPostsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [user?._id]);

  if (!user) return null;

  const name = displayName(user);

  async function onLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logoutAPI();
      setUser(null);
      router.replace("/sign-in");
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

      <section className="mt-8">
        <h2 className="font-serif text-3xl tracking-tight">Posts</h2>
        {!postsLoaded ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-muted/70 px-5 py-8 text-sm text-muted-foreground">
            You have not posted yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {posts.map((post) => (
              <li
                key={post._id}
                className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10 sm:px-5"
              >
                <Posts post={post} currentUserId={user._id} />
              </li>
            ))}
          </ul>
        )}
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
