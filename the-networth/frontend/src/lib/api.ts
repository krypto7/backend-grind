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
  const response = await fetch(`${baseURL}/auth/verify-otp/${email}`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ otp }),
  })
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "Unable to verify OTP.");
  }

  return data;
}

export const resendOTP = async (email: string) => {
  const response = await fetch(`${baseURL}/auth/resend-otp/${email}`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "Unable to resend OTP.");
  }
  return data;
}

export const getCurrentUser = async (): Promise<{ user: AccountUser }> => {
  const response = await fetch(`${baseURL}/auth/getCurrentUser`, {
    credentials: "include",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || "Unable to load your account.");
  }

  return data;
};

export const logoutAPI = async () => {
  const response = await fetch(`${baseURL}/auth/logout`, {
    credentials: "include",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || data.message || "Unable to log out.");
  }

  return data;
};