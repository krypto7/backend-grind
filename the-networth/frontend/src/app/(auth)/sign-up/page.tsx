import type { Metadata } from "next";
import { GuestOnly } from "@/components/auth/guest-only";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <GuestOnly>
      <SignUpForm />
    </GuestOnly>
  );
}
