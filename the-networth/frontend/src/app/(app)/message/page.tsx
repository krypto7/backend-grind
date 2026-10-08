import type { Metadata } from "next";
import { MessageScreen } from "@/components/app/message-screen";

export const metadata: Metadata = {
  title: "Message",
};

export default function MessagePage() {
  return <MessageScreen />;
}
