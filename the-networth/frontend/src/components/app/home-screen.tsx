"use client";

import { useEffect, useState } from "react";
import { ImageIcon, SendIcon } from "lucide-react";
import { AccountAvatar } from "@/components/app/account-avatar";
import { useAccount } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { createPostAPI, getPostsAPI, Post } from "@/lib/api";

export function HomeScreen() {
  const { user } = useAccount();
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getPostsAPI()
      .then((response) => {
        if (active) setPosts(response);
      })
      .catch(() => {
        if (active) setError("Unable to load posts.");
      });

    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setError("");
    try {
      const response = await createPostAPI(content);
      setPosts((current) => [response, ...current]);
      setDraft("");
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create post.",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <p className="text-sm font-medium text-primary">Home</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Your feed</h1>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
      >
        <div className="flex gap-3">
          <AccountAvatar user={user} className="size-10 shrink-0 text-sm" />
          <label htmlFor="post" className="sr-only">
            Create a post
          </label>
          <textarea
            id="post"
            name="post"
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Share a note..."
            className="min-h-20 w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-3">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="size-4" />
            Photo
          </span>
          <Button type="submit" className="h-9 px-3" disabled={!draft.trim()}>
            <SendIcon />
            Post
          </Button>
        </div>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="mt-4 grid gap-3">
        {posts.map((post) => {
          const mine = post.user?._id === user._id;
          return (
            <li
              key={post._id}
              className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10 sm:px-5"
            >
              <div className="flex items-center gap-3">
                {mine ? (
                  <AccountAvatar user={user} className="size-10 text-sm" />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#14241f] text-xs font-medium text-[#f6f3ec]">
                    {post.user?.firstname?.charAt(0) ?? "?"}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    @{post.user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6">{post.content}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
