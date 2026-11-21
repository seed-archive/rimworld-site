// The header's menu (D15: at most Catalog, Guides, Tools, Quests, named the
// same in every game): each item its index page and the pages in its
// dropdown, with the sentence its index gives each page.
export type MenuPage = { href: string; id: string; line: string };
export type MenuItem = { id: string; href: string; pages: MenuPage[] };

export const MENU: MenuItem[] = [
  {
    id: "archive.tools",
    href: "/tools",
    pages: [
      { href: "/tools/globe", id: "archive.globe", line: "pages.tools.globe" },
      { href: "/tools/map", id: "archive.map", line: "pages.tools.map" },
    ],
  },
];
