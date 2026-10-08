import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasSessionCookie } from "@/lib/session";

const protectedPaths = ["/home", "/explore", "/message", "/profile"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = hasSessionCookie(request.cookies);

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(signedIn ? "/home" : "/sign-in", request.url),
    );
  }

  if (protectedPaths.includes(pathname) && !signedIn) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
