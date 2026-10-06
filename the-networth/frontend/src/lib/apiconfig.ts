const baseURL = "http://localhost:8000/api";

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
