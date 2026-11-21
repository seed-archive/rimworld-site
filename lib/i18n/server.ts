import { flattenMessages } from "@seed-archive/ui/localization";

import { EnabledLanguages, i18n } from "@/lib/i18n";

// The messages for a server component, by the same keys the client uses
// (react-intl runs only in the browser): plain `{name}` holes, nothing more.
export const serverMessages = flattenMessages(i18n[EnabledLanguages.EN]);

export function serverFormat(
  id: string,
  values: Record<string, string | number> = {},
): string {
  const message = serverMessages[id] ?? id;
  return message.replace(/\{(\w+)\}/g, (hole, name: string) =>
    name in values ? String(values[name]) : hole,
  );
}
