import { Suspense } from "react";
import type { Metadata } from "next";

import { MapScreen } from "@/components/rimworld/MapScreen";

export const metadata: Metadata = {
  title: "Test colony map — RimWorld — Seed Archive",
  description: "The map of a RimWorld tile from its seed, tile and map size.",
  alternates: { canonical: "/tools/map" },
};

export default function MapPage() {
  return (
    <Suspense>
      <MapScreen />
    </Suspense>
  );
}
