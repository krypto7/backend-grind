"use client";

import { useEffect, useRef, useState } from "react";
import {
  HeartIcon,
  ImageIcon,
  MessageCircleIcon,
  PlayIcon,
  SendIcon,
  ShareIcon,
  XIcon,
} from "lucide-react";
import { AccountAvatar } from "@/components/app/account-avatar";
import { useAccount } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { createPostAPI, getPostsAPI, Post } from "@/lib/api";
import { useRouter } from "next/navigation";
import Posts from "./posts";

type MediaPreview = {
  id: string;
  kind: "image" | "video";
  src: string;
};

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function captureVideoThumbnail(file: File) {
  const url = URL.createObjectURL(file);

  return new Promise<string>((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    const finish = (thumbnail: string) => {
      URL.revokeObjectURL(url);
      resolve(thumbnail);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read video"));
    };

    video.onloadeddata = () => {
      const target = Number.isFinite(video.duration)
        ? Math.min(0.2, video.duration / 2)
        : 0;

      if (target > 0) {
        video.currentTime = target;
        return;
      }

      finish(drawVideoFrame(video));
    };

    video.onseeked = () => finish(drawVideoFrame(video));
  });
}

function drawVideoFrame(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  if (!context || !video.videoWidth) return "";

  const scale = Math.max(
    canvas.width / video.videoWidth,
    canvas.height / video.videoHeight,
  );
  const width = video.videoWidth * scale;
  const height = video.videoHeight * scale;
  context.drawImage(
    video,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height,
  );
  return canvas.toDataURL("image/jpeg", 0.8);
}

export function HomeScreen() {
  const { user } = useAccount();
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const previewsRef = useRef<MediaPreview[]>([]);
  const router = useRouter();

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((preview) => {
        if (preview.src.startsWith("blob:")) URL.revokeObjectURL(preview.src);
      });
    };
  }, []);

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

  function clearPhotos() {
    previews.forEach((preview) => {
      if (preview.src.startsWith("blob:")) URL.revokeObjectURL(preview.src);
    });
    setPhotos([]);
    setPreviews([]);
  }

  function removeMedia(index: number) {
    const preview = previews[index];
    if (preview?.src.startsWith("blob:")) URL.revokeObjectURL(preview.src);
    setPhotos((current) => current.filter((_, item) => item !== index));
    setPreviews((current) => current.filter((_, item) => item !== index));
  }

  async function onPhotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const room = 5 - photos.length;
    const selected = Array.from(event.target.files ?? [])
      .filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/"),
      )
      .slice(0, Math.max(room, 0));
    event.target.value = "";
    if (selected.length === 0) return;

    const nextPreviews: MediaPreview[] = [];
    for (const file of selected) {
      const id = crypto.randomUUID();
      if (isVideo(file)) {
        try {
          nextPreviews.push({
            id,
            kind: "video",
            src: await captureVideoThumbnail(file),
          });
        } catch {
          nextPreviews.push({ id, kind: "video", src: "" });
        }
      } else {
        nextPreviews.push({
          id,
          kind: "image",
          src: URL.createObjectURL(file),
        });
      }
    }

    setPhotos((current) => [...current, ...selected]);
    setPreviews((current) => [...current, ...nextPreviews]);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || posting) return;

    setError("");
    setPosting(true);
    try {
      const response = await createPostAPI(content, photos);
      setPosts((current) => [response, ...current]);
      setDraft("");
      clearPhotos();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create post.",
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="w-full">
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
        {previews.length > 0 ? (
          <ul className="mt-3 flex gap-2 overflow-x-auto">
            {previews.map((preview, index) => (
              <li key={preview.id} className="relative shrink-0">
                {preview.src ? (
                  // Local thumbnail of a file chosen for this post.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.src}
                    alt=""
                    className="size-20 rounded-xl object-cover ring-1 ring-foreground/10"
                  />
                ) : (
                  <span className="grid size-20 place-items-center rounded-xl bg-[#14241f] ring-1 ring-foreground/10" />
                )}
                <button
                  type="button"
                  aria-label="Remove media"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-[#14241f] text-[#f6f3ec]"
                >
                  <XIcon className="size-3" />
                </button>
                {preview.kind === "video" ? (
                  <span className="absolute right-1 bottom-1 grid size-5 place-items-center rounded-full bg-[#14241f]/80 text-[#f6f3ec]">
                    <PlayIcon className="size-3 fill-current" />
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="post-media"
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            >
              <ImageIcon className="size-4" />
              Photo or video
              <input
                id="post-media"
                name="media"
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                onChange={onPhotosChange}
              />
            </label>
            {photos.length > 0 ? (
              <button
                type="button"
                onClick={clearPhotos}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              >
                <XIcon className="size-3" />
                Clear
              </button>
            ) : null}
          </div>
          <Button
            type="submit"
            className="h-9 px-3"
            disabled={!draft.trim() || posting}
          >
            <SendIcon />
            {posting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="mt-4 grid gap-3">
        {posts.map((item) => {
          return (
            <li
              key={item._id}
              className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10 sm:px-5"
            >
              <Posts post={item} currentUserId={user._id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
