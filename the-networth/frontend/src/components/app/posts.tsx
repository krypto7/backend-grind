import { AccountAvatar } from "@/components/app/account-avatar";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Post, PostMedia } from "@/lib/api";
import { cn } from "cn";

type PostCardProps = {
  post: Post;
};

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

function Posts({ post }: PostCardProps) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-3 justify-between">
        <div className="flex gap-4">
          <AccountAvatar
            user={post.user}
            className="size-10 shrink-0 text-sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              @{post.user?.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </p>
          </div>
        </div>
        <div>
          <Ellipsis />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6">{post.content}</p>
      {post.media?.some((item) => item.mediaUrl) ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <PostPhotos media={post.media} />
        </div>
      ) : null}
      <div className="flex gap-2 pt-3">
        <Button variant="ghost" size="sm">
          <HeartIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/post/${post._id}`)}
        >
          <MessageCircleIcon />
          {post.comments?.length}
        </Button>
        <Button variant="ghost" size="sm">
          <ShareIcon />
        </Button>
        {/* //add save post button */}
      </div>
    </div>
  );
}

export default Posts;
