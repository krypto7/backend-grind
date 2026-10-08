import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { hasSessionCookie } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!hasSessionCookie(cookieStore)) redirect("/");

  return <AppShell>{children}</AppShell>;
}
