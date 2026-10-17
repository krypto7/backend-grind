"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AccountAvatar } from "@/components/app/account-avatar";
import { addCommentAPI, getPostDetailsAPI, Post } from "@/lib/api";
import { useParams } from "next/navigation";
import { Ellipsis, Send, UserRound } from "lucide-react";
import Posts from "@/components/app/posts";
import { useAccount } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";

export default function PostDataDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAccount();
  const [postData, setPostData] = useState<Post | null>(null);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isEdit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;

    const fetchPostDetail = async () => {
      try {
        const data = await getPostDetailsAPI(id);

        if (!ignore) {
          setPostData(data);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPostDetail();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenCommentId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = commentDraft.trim();

    if (!postData || !user || !content || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const { comment } = await addCommentAPI(postData._id, content);
      setPostData((currentPost) =>
        currentPost
          ? {
              ...currentPost,
              comments: [...(currentPost.comments ?? []), { ...comment, user }],
            }
          : currentPost,
      );
      setCommentDraft("");
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : "Unable to add comment.",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {loading && <p>Loading...</p>}
      {postData && (
        <div>
          <Posts post={postData} />
          <section className="mt-8 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Comments</h2>
              <span className="text-sm text-muted-foreground">
                {postData.comments?.length ?? 0}
              </span>
            </div>

            <form
              onSubmit={submitComment}
              className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {user ? (
                  <AccountAvatar
                    user={user}
                    className="size-10 shrink-0 text-sm"
                  />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    <UserRound className="size-4" aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <label htmlFor="comment-draft" className="sr-only">
                    Write a comment
                  </label>
                  <textarea
                    id="comment-draft"
                    name="comment"
                    rows={3}
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder={
                      user ? "Share your thoughts..." : "Sign in to comment."
                    }
                    disabled={!user || isSubmittingComment}
                    aria-describedby={
                      commentError ? "comment-error" : undefined
                    }
                    className="min-h-24 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Keep the conversation thoughtful.
                    </p>
                    <Button
                      type="submit"
                      disabled={
                        !user || !commentDraft.trim() || isSubmittingComment
                      }
                      className="gap-2 rounded-full px-4"
                    >
                      <Send className="size-4" aria-hidden="true" />
                      {isSubmittingComment ? "Posting..." : "Post comment"}
                    </Button>
                  </div>
                </div>
              </div>
              {commentError && (
                <p
                  id="comment-error"
                  role="alert"
                  className="mt-3 text-sm text-destructive"
                >
                  {commentError}
                </p>
              )}
            </form>

            {postData?.comments?.length ? (
              <div className="mt-6 space-y-5">
                {postData.comments.map((comment) => (
                  <article
                    key={comment._id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        {comment.user ? (
                          <AccountAvatar
                            user={comment.user}
                            className="size-10 shrink-0 text-sm"
                          />
                        ) : (
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                            <UserRound className="size-4" aria-hidden="true" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            @{comment.user?.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="relative" ref={menuRef}>
                        <button
                          key={comment._id}
                          onClick={() =>
                            setOpenCommentId(
                              openCommentId === comment._id
                                ? null
                                : comment._id,
                            )
                          }
                          className="rounded-full p-2 hover:bg-muted"
                          aria-label="Open menu"
                          aria-expanded={openCommentId === comment._id}
                        >
                          <Ellipsis />
                        </button>
                        {openCommentId === comment._id && (
                          <div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-lg border bg-background p-1 shadow-lg">
                            <ul>
                              {user && comment.user?._id === user._id && (
                                <>
                                  <li>
                                    <button className="w-full rounded-md px-3 py-2 text-left hover:bg-muted">
                                      Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button className="w-full rounded-md px-3 py-2 text-left hover:bg-muted">
                                      Delete
                                    </button>
                                  </li>
                                </>
                              )}

                              <li>
                                <button className="w-full rounded-md px-3 py-2 text-left hover:bg-muted">
                                  Report
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {}
                    <p className="mt-3 pl-[52px] text-sm leading-6">
                      {comment.content}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No comments yet. Start the conversation.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
