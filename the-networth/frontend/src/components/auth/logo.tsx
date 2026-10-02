import { cn } from "cn";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg text-sm font-semibold",
          light
            ? "bg-white/10 text-[#f6f3ec] ring-1 ring-white/15"
            : "bg-primary text-primary-foreground",
        )}
      >
        N
      </span>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          light ? "text-[#f6f3ec]" : "text-foreground",
        )}
      >
        Networth
      </span>
    </span>
  );
}
