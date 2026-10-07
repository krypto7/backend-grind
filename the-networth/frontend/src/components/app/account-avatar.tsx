import type { AccountUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export function displayName(user: Pick<AccountUser, "firstname" | "lastname">) {
  return `${user.firstname} ${user.lastname}`
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function initials(user: Pick<AccountUser, "firstname" | "lastname">) {
  return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
}

export function AccountAvatar({
  user,
  className,
}: {
  user: AccountUser;
  className?: string;
}) {
  if (user.avtar) {
    return (
      // Profile photos are stored on Cloudinary.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avtar}
        alt=""
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-primary font-medium text-primary-foreground",
        className,
      )}
    >
      {initials(user)}
    </span>
  );
}
