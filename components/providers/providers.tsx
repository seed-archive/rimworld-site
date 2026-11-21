"use client";

import { PropsWithChildren } from "react";
import { Providers as ArchiveProviders } from "@seed-archive/ui/providers";

import { EnabledLanguages, i18n } from "@/lib/i18n";

// No Supabase yet: the section has no tables and no sign-in of its own until a
// page needs the archive's shared one (D13).
const noSupabase = () => null;

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ArchiveProviders
      i18n={i18n}
      defaultLanguage={EnabledLanguages.EN}
      getSupabase={noSupabase}
    >
      {children}
    </ArchiveProviders>
  );
};
