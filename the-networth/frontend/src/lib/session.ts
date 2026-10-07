import { getCurrentUser, refreshSession, type AccountUser } from "@/lib/api";

async function restoreSessionOnce(): Promise<AccountUser | null> {
  try {
    const current = await getCurrentUser();
    return current.user;
  } catch {
    // The access cookie is missing or expired. The refresh cookie may still be valid.
  }

  try {
    await refreshSession();
    const current = await getCurrentUser();
    return current.user;
  } catch {
    return null;
  }
}

let pending: Promise<AccountUser | null> | null = null;

export function restoreSession(): Promise<AccountUser | null> {
  if (!pending) {
    pending = restoreSessionOnce().finally(() => {
      pending = null;
    });
  }

  return pending;
}
