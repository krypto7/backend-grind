import type { Metadata } from "next";
import { GuestOnly } from "@/components/auth/guest-only";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <GuestOnly>
      <SignInForm />
    </GuestOnly>
  );
}
