# RimWorld site

The RimWorld section of Seed Archive, to be served at https://seedarchive.gg/rimworld/ (`basePath` `/rimworld`,
`lib/site.ts`); the RimWorld generator (`../rimworld`) fills its data. How the games and the portal fit together is
`../.claude/rules/architecture.md`; how to work here is `.claude/rules/`.

## Parts

| Part         | What it is                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| `app`        | Next.js routes: the home page, `tools`, `tools/globe` (the test planet), `tools/map` (the test colony map)   |
| `components` | `archive` (the shared header, the section's footer), `providers` (theme, intl), `rimworld` (the test planet over the shared globe `@seed-archive/globe`, the test colony map over the shared viewer `@seed-archive/map`, the game's settings fields), `tools` (the Tools index) |
| `lib`        | `site.ts` (the section's prefix), `i18n` (messages), `menu.ts` (the header's menu), `rimworld` (palettes; the game's world and map settings, their address and the generator's key) |
| `public`     | static files; `wasm/` the RimWorld generator built to WebAssembly (`rimworld.js`, `rimworld_bg.wasm`, generated) |

## Run

```bash
npm install      # @seed-archive/ui comes from GitHub Packages: the token in ~/.npmrc
npm run dev      # the site on localhost:5040/rimworld
npm run lint
npm run build
```
