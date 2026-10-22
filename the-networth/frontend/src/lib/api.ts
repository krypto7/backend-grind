const baseURL = "/api";

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

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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

function refreshSession() {
  if (!refreshRequest) {
    const refresh = async () => {
      if (typeof navigator !== "undefined" && navigator.locks) {
        return await navigator.locks.request(REFRESH_LOCK, async () =>
          refreshAccessToken(),
        );
      }

      return refreshAccessToken();
    };

    refreshRequest = refresh().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
}

async function authFetch(input: string, init?: RequestInit, retried = false) {
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

export const getCurrentUser = async () => {
  const response = await authFetch(`${baseURL}/auth/getCurrentUser`);
  const data = await readJson(response);

  if (!response.ok) {
    throw new ApiError(
      data.msg || "Unable to load your account.",
      response.status,
    );
  }

  return data as { user: AccountUser };
};

export function loadAccount() {
  if (!accountRequest) {
    accountRequest = getCurrentUser()
      .then((data) => data.user)
      .catch(() => null)
      .finally(() => {
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

export type PostMedia = {
  mediaType?: "image" | "video" | "audio" | null;
  mediaUrl?: string | null;
  publicId?: string | null;
};

export type PostComment = {
  _id: string;
  content: string;
  user: Pick<
    PostAuthor,
    "_id" | "firstname" | "lastname" | "username" | "avtar" | "email"
  > | null;
  createdAt?: string;
};

export type Post = {
  _id: string;
  content: string;
  user: PostAuthor;
  media?: PostMedia[];
  comments?: PostComment[];
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

export const createPostAPI = async (content: string, media: File[] = []) => {
  const formData = new FormData();
  formData.append("content", content);
  media.forEach((file) => formData.append("media", file));

  const response = await authFetch(`${baseURL}/post/create-post`, {
    method: "POST",
    body: formData,
  });
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to create post.");
  }

  return data as Post;
};

export const getUserPostAPI = async (userId: string) => {
  const response = await authFetch(`${baseURL}/post/get-userPosts/${userId}`);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to get user posts.");
  }

  return data as Post[];
};

export const getPostDetailsAPI = async (postId: string) => {
  try {
    const response = await authFetch(`${baseURL}/post/post-details/${postId}`);
    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        data.msg || data.message || "Unable to get post details.",
      );
    }

    return data as Post;
  } catch (error) {
    throw new Error("An error occurred while fetching post details.");
  }
};

export const addCommentAPI = async (postId: string, content: string) => {
  const response = await authFetch(`${baseURL}/comment/add-comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, content }),
  });
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to add comment.");
  }

  return data as {
    comment: Pick<PostComment, "_id" | "content" | "createdAt">;
  };
};

export const editCommentAPI = async (commentId: string, content: string) => {
  const response = await authFetch(
    `${baseURL}/comment/edit-comment`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, content }),
    },
  );
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to edit comment.");
  }

  return data as {
    comment: Pick<PostComment, "_id" | "content" | "createdAt">;
  };
};
