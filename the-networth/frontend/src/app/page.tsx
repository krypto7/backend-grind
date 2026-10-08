import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSessionCookie } from "@/lib/session";

export default async function Home() {
  const cookieStore = await cookies();
  redirect(hasSessionCookie(cookieStore) ? "/home" : "/sign-in");
}
