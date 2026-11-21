import type { NestedMessages } from "@seed-archive/ui/localization";

import en from "./en.json";

// English only for now.
export enum EnabledLanguages {
  EN = "EN",
}

export const i18n: Record<EnabledLanguages, NestedMessages> = {
  [EnabledLanguages.EN]: en,
};
