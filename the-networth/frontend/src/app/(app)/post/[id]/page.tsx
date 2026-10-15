"use client";
import { AccountAvatar } from "@/components/app/account-avatar";
import { getPostDetailsAPI, Post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartIcon, MessageCircleIcon, ShareIcon } from "lucide-react";

export default function postDataDetails() {
  const { id } = useParams<{ id: string }>();
  const [postData, setpostData] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const postDataDetails = async () => {
    setLoading(true);
    const data = await getPostDetailsAPI(id);
    setpostData(data);
    setLoading(false);
  };

  useEffect(() => {
    postDataDetails();
  }, [id]);

  console.log("postData=====", postData);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {postData && (
        <div>
          <div className="flex items-center gap-3">
            {postData?.user ? (
              <AccountAvatar
                user={postData?.user}
                className="size-10 text-sm"
              />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#14241f] text-xs font-medium text-[#f6f3ec]">
                {postData.user?.firstname?.charAt(0) ?? "?"}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                @{postData.user?.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {postData.createdAt
                  ? new Date(postData.createdAt).toLocaleString()
                  : ""}
              </p>
            </div>
          </div>
          <div>
            <p className="mt-3 text-sm leading-6">{postData.content}</p>
          </div>
          {postData.media?.some((item) => item.mediaUrl) ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {postData.media.map((item) =>
                item.mediaUrl ? (
                  item.mediaType === "video" ? (
                    <video
                      key={item.publicId ?? item.mediaUrl}
                      src={item.mediaUrl}
                      controls
                      className="max-h-80 min-w-40 rounded-xl bg-[#14241f]"
                    />
                  ) : (
                    // Photos are stored on Cloudinary.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={item.publicId ?? item.mediaUrl}
                      src={item.mediaUrl}
                      alt=""
                      className="max-h-80 w-full rounded-xl object-cover"
                    />
                  )
                ) : null,
              )}
            </div>
          ) : null}
          <div className="flex gap-2 pt-3">
            <Button variant="ghost" size="sm">
              <HeartIcon />
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircleIcon />1
            </Button>
            <Button variant="ghost" size="sm">
              <ShareIcon />
            </Button>
            {/* //add save post button */}
          </div>
          <hr />
          <div>
            <p className="text-sm font-medium">Comments</p>
            {postData?.comments?.length ? (
              <div className="mt-3">
                {postData.comments.map((comment) => (
                  <div>
                    <div className="flex items-center gap-3">
                      {comment?.user ? (
                        <AccountAvatar
                          user={comment.user}
                          className="size-10 text-sm"
                        />
                      ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#14241f] text-xs font-medium text-[#f6f3ec]">
                          {comment.user?.firstname?.charAt(0) ?? "?"}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          @{comment.user?.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {postData.createdAt
                            ? new Date(postData.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p key={comment._id} className="text-sm">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
