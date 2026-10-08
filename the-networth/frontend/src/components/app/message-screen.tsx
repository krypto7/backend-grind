"use client";
import { useState } from "react";

const threads = [
  {
    username: "mira.cole",
    preview: "That first line finally works.",
    reply: "Glad it landed. I will read it again in the morning.",
    time: "2h",
  },
  {
    username: "jonas.lee",
    preview: "Sending the notes over tonight.",
    reply: "I will look as soon as they arrive.",
    time: "1d",
  },
  {
    username: "ada.nwosu",
    preview: "Profile page looks calm.",
    reply: "That was the aim. Thank you for looking.",
    time: "3d",
  },
];

export function MessageScreen() {
  const [activeUsername, setActiveUsername] = useState(threads[0].username);
  const active =
    threads.find((thread) => thread.username === activeUsername) ?? threads[0];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="text-sm font-medium text-primary">Message</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Conversations</h1>

      <div className="mt-8 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 md:grid md:min-h-[28rem] md:grid-cols-[16rem_minmax(0,1fr)]">
        <ul className="border-b border-border/80 md:border-r md:border-b-0">
          {threads.map((thread) => (
            <li key={thread.username}>
              <button
                type="button"
                onClick={() => setActiveUsername(thread.username)}
                className={`flex w-full items-start justify-between gap-3 px-4 py-4 text-left ${
                  thread.username === active.username
                    ? "bg-muted"
                    : "hover:bg-muted/60"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    @{thread.username}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted-foreground">
                    {thread.preview}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {thread.time}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <section className="flex min-h-80 flex-col px-5 py-5">
          <p className="text-sm font-medium">@{active.username}</p>
          <div className="mt-6 flex flex-1 flex-col justify-end gap-3">
            <p className="max-w-sm self-start rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-6">
              {active.preview}
            </p>
            <p className="max-w-sm self-end rounded-2xl rounded-br-md bg-[#14241f] px-4 py-3 text-sm leading-6 text-[#f6f3ec]">
              {active.reply}
            </p>
          </div>
          <form
            className="mt-6 flex gap-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="message" className="sr-only">
              Write a message
            </label>
            <input
              id="message"
              placeholder="Write a message"
              className="h-11 min-w-0 flex-1 rounded-xl bg-background px-3 text-sm ring-1 ring-foreground/10 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
