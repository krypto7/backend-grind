import type { Metadata } from "next";
import { ProfileScreen } from "@/components/app/profile-screen";

export const metadata: Metadata = {
  title: "Profile",
};

interface profileProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: profileProps) {
  const { id } = await params;
  return <ProfileScreen key={id} userId={id} />;
}
