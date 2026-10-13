const baseURL = "http://localhost:8000/api";

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

const ACCOUNT_KEY = "account";

export function saveAccount(user: AccountUser) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(user));
}

export function readAccount(): AccountUser | null {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AccountUser;
  } catch {
    return null;
  }
}

export function clearAccount() {
  localStorage.removeItem(ACCOUNT_KEY);
}

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

async function readJson(response: Response) {
  return response.json().catch(() => ({}));
}

function apiFetch(input: string, init?: RequestInit) {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

export const editProfileAPI = async (formData: FormData) => {
  const response = await apiFetch(`${baseURL}/auth/edit-profile`, {
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
  const response = await apiFetch(`${baseURL}/auth/logout`);
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
  const response = await apiFetch(`${baseURL}/post/create-post`, {
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

export const getUserPostAPI = async (userId: string) => {
  const response = await apiFetch(`${baseURL}/post/get-userPosts/${userId}`);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to get user posts.");
  }

  return data as Post[];
};
