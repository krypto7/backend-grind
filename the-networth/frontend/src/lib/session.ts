export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

export function hasSessionCookie(cookieStore: { has(name: string): boolean }) {
  return cookieStore.has(ACCESS_COOKIE) || cookieStore.has(REFRESH_COOKIE);
}
