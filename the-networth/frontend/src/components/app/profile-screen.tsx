"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookmarkIcon,
  BadgeCheckIcon,
  FileTextIcon,
  HeartIcon,
  PencilIcon,
} from "lucide-react";
import { AccountAvatar, displayName } from "@/components/app/account-avatar";
import { EditProfileDialog } from "@/components/app/edit-profile-dialog";
import { useAccount } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { getUserPostAPI, type Post } from "@/lib/api";
import { cn } from "@/lib/utils";
import Posts from "./posts";

type ProfileTab = "posts" | "liked" | "saved";

interface ProfileScreenProps {
  userId: string;
}

export function ProfileScreen({ userId }: ProfileScreenProps) {
  const { user, setUser } = useAccount();

  console.log("userId====", userId);

  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

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
  const profileStats = [
    { label: "Posts", value: postsLoaded ? String(posts.length) : "—" },
    { label: "Followers", value: "—" },
    { label: "Following", value: "—" },
  ];
  const profileTabs: { id: ProfileTab; label: string }[] = [
    { id: "posts", label: "Posts" },
    { id: "liked", label: "Liked posts" },
    { id: "saved", label: "Saved posts" },
  ];
  const EmptyTabIcon = activeTab === "liked" ? HeartIcon : BookmarkIcon;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
          Your space
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          Profile
        </h1>
      </header>

      <section className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10">
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#14241f] via-[#1f5145] to-[#719784] sm:h-40">
          <div className="absolute -top-28 right-0 size-64 rounded-full border border-white/15" />
          <div className="absolute -right-4 -bottom-36 size-64 rounded-full border border-white/15" />
          <p className="absolute right-5 bottom-4 text-[10px] font-semibold tracking-[0.28em] text-white/70 uppercase sm:right-8">
            The Networth
          </p>
        </div>

        <div className="px-5 pb-5 sm:px-8 sm:pb-7">
          <div className="-mt-11 flex flex-wrap items-end justify-between gap-3 relative z-10">
            <AccountAvatar
              user={user}
              className="size-22 text-2xl ring-4 ring-card sm:size-24"
            />
            <div className="flex items-center gap-2 pb-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <PencilIcon aria-hidden="true" />
                Edit profile
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words font-serif text-3xl tracking-tight">
                {name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                @{user.username}
              </p>
              <p className="mt-3 break-all text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            <span
              className={cn(
                "mt-1 rounded-full px-3 py-1 text-xs font-medium",
                user.isVerified === false
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary",
              )}
            >
              {user.isVerified === false ? (
                "Email unverified"
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheckIcon
                    className="size-4 fill-sky-500 text-white"
                    aria-hidden="true"
                  />
                  Email verified
                </span>
              )}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-3 divide-x divide-border border-y border-border py-4">
            {profileStats.map((stat) => (
              <div key={stat.label} className="px-2 text-center">
                <dd className="text-lg font-semibold tabular-nums">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          {error ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div
          role="tablist"
          aria-label="Profile posts"
          className="grid grid-cols-3 border-b border-border px-2 sm:px-5"
        >
          {profileTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon =
              tab.id === "posts"
                ? FileTextIcon
                : tab.id === "liked"
                  ? HeartIcon
                  : BookmarkIcon;

            return (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="profile-tab-panel"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex min-h-14 items-center justify-center gap-1.5 border-b-2 px-1 text-xs transition-colors hover:bg-muted/50 sm:gap-2 sm:text-sm",
                  isActive
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                <TabIcon className="size-4" aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.id === "posts" && postsLoaded ? (
                  <span className="text-xs tabular-nums">{posts.length}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div
          id="profile-tab-panel"
          role="tabpanel"
          aria-labelledby={`${activeTab}-tab`}
          className="p-4 sm:p-5"
        >
          {activeTab === "posts" ? (
            !postsLoaded ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading posts...
              </p>
            ) : posts.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
                <FileTextIcon
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-medium">No posts yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your posts will show up here.
                </p>
              </div>
            ) : (
              <ul className="grid gap-4">
                {posts.map((post) => (
                  <li
                    key={post._id}
                    className="rounded-2xl bg-background px-4 py-4 ring-1 ring-foreground/10 sm:px-5"
                  >
                    <Posts post={post} />
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <EmptyTabIcon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-serif text-2xl tracking-tight">
                {activeTab === "liked"
                  ? "Liked posts will live here"
                  : "Saved posts will live here"}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {activeTab === "liked"
                  ? "Posts you like will be collected in this space."
                  : "Keep posts you want to revisit in this space."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => router.push("/explore")}
              >
                Explore posts
              </Button>
            </div>
          )}
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
