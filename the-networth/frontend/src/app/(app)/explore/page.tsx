import type { Metadata } from "next";
import { ExploreScreen } from "@/components/app/explore-screen";

export const metadata: Metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return <ExploreScreen />;
}
