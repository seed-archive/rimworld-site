# Repository and release

- Work and commit on `dev`; every pull request, Renovate's included, targets `dev`. `main` holds releases: the
  coordinator merges `dev` into `main` on the owner's word (`../.claude/rules/architecture.md`, Repositories).
- **The RimWorld session owns this repository**: pages, texts, data, the globe, components.
- **The coordinating session owns what the games share**: the domain and DNS, the Vercel project and its environment
  variables, the portal's routing of `/rimworld/*`, and the zone contract — `basePath` stays `/rimworld`
  (`lib/site.ts`), the domain and sign-in stay shared. A change to any of these goes through the coordinator.
- The site is public: nothing from the generator's private repository — no paths, file or function names, or methods
  — reaches it. It says "the RimWorld generator".
- Every word a visitor reads goes through `react-intl` (`lib/i18n/*.json`); long texts will be Markdown.
- No Supabase and no Sentry yet: added when a page needs them, the way the other sites have them.
- Release notes live in the portal (`content/release-notes/rimworld.md`, D16), not here.
- The theme is light only, in the No Man's Sky site's colours, until D14.
