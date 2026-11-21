import { Suspense } from "react";
import type { Metadata } from "next";

import { GlobeScreen } from "@/components/rimworld/GlobeScreen";

export const metadata: Metadata = {
  title: "Test planet — RimWorld — Seed Archive",
  description: "A RimWorld planet of the game's own tiles drawn as a globe.",
  alternates: { canonical: "/tools/globe" },
};

export default function GlobePage() {
  return (
    <Suspense>
      <GlobeScreen />
    </Suspense>
  );
}
