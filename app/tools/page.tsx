import type { Metadata } from "next";

import { ToolsIndex } from "@/components/tools/ToolsIndex";

export const metadata: Metadata = {
  title: "Tools in RimWorld — Seed Archive",
  description: "Tools that read a RimWorld planet from its seed.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return <ToolsIndex />;
}
