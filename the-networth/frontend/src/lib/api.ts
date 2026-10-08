const baseURL = "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type AccountUser = {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  avtar?: string | null;
  isVerified?: boolean;
  createdAt?: string;
};

export const signinAPI = async (formData: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`${baseURL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || "Unable to sign in.");
  }

  return data;
};

export const signupAPI = async (formData: FormData) => {
  const response = await fetch(`${baseURL}/auth/signup`, {
    method: "POST",
    // credentials: "include",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || "Unable to sign up.");
  }

  return data;
};

export const verifyOTP = async (email: string, otp: string) => {
  const response = await fetch(`${baseURL}/auth/verify-otp/${email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ otp }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "Unable to verify OTP.");
  }

  return data;
};

export const resendOTP = async (email: string) => {
  const response = await fetch(`${baseURL}/auth/resend-otp/${email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "Unable to resend OTP.");
  }
  return data;
};

const REFRESH_LOCK = "networth-auth-refresh";

let refreshRequest: Promise<boolean> | null = null;
let accountRequest: Promise<AccountUser | null> | null = null;

async function readJson(response: Response) {
  return response.json().catch(() => ({}));
}

async function refreshAccessToken() {
  const response = await fetch(`${baseURL}/auth/refresh`, {
    credentials: "include",
  });
  return response.ok;
}

async function accessCookieWorks(): Promise<boolean | null> {
  const response = await fetch(`${baseURL}/auth/getCurrentUser`, {
    credentials: "include",
  });
  if (response.ok) return true;
  if (response.status === 401) return false;
  return null;
}

async function refreshAfterWaiting(): Promise<boolean> {
  const accessCookieValid = await accessCookieWorks();
  if (accessCookieValid === true) return true;
  if (accessCookieValid === null) return false;
  return refreshAccessToken();
}

function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    const run =
      typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request(REFRESH_LOCK, refreshAfterWaiting)
        : refreshAfterWaiting();

    refreshRequest = run.finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
}

export async function authFetch(
  input: string,
  init?: RequestInit,
  retried = false,
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (response.status !== 401 || retried || input.includes("/auth/refresh")) {
    return response;
  }

  const refreshed = await refreshSession();
  if (!refreshed) return response;
  return authFetch(input, init, true);
}

export const getCurrentUser = async (): Promise<{ user: AccountUser }> => {
  const response = await authFetch(`${baseURL}/auth/getCurrentUser`);
  const data = await readJson(response);

  if (!response.ok) {
    throw new ApiError(
      data.msg || "Unable to load your account.",
      response.status,
    );
  }

  return data;
};

async function readAccount(): Promise<AccountUser | null> {
  try {
    const current = await getCurrentUser();
    return current.user;
  } catch {
    return null;
  }
}

export function loadAccount(): Promise<AccountUser | null> {
  if (!accountRequest) {
    accountRequest = readAccount().finally(() => {
      accountRequest = null;
    });
  }

  return accountRequest;
}

export const editProfileAPI = async (formData: FormData) => {
  const response = await authFetch(`${baseURL}/auth/edit-profile`, {
    method: "PATCH",
    body: formData,
  });
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || "Unable to update your profile.");
  }

  return data as { user: AccountUser };
};

export const logoutAPI = async () => {
  const response = await authFetch(`${baseURL}/auth/logout`);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to log out.");
  }

  return data;
};

export type PostAuthor = {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  avtar?: string | null;
  isVerified?: boolean;
  createdAt?: string;
};

export type Post = {
  _id: string;
  content: string;
  user: PostAuthor;
  createdAt?: string;
};

export const getPostsAPI = async () => {
  const response = await fetch(`${baseURL}/post/get-posts`);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to get posts.");
  }

  return data as Post[];
};

export const createPostAPI = async (content: string) => {
  const response = await authFetch(`${baseURL}/post/create-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to create post.");
  }

  return data as Post;
};
