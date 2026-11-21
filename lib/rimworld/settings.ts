import { BASE_PATH } from "@/lib/site";

// Everything the game lets a player choose for a world and a colony map, with
// the game's own values and defaults (RimWorld 1.6, the world page and the
// advanced settings of a new game).
export type Settings = {
  seed: string;
  // Globe coverage, percent of the planet generated.
  coverage: number;
  // The world page's sliders, seven steps each, 3 the middle.
  rainfall: number;
  temperature: number;
  population: number;
  landmarks: number;
  // Pollution, percent, in steps of five (Biotech).
  pollution: number;
  // The tile settled, its number on the planet; null until one is picked.
  tile: number | null;
  // The map's side, in cells.
  size: number;
  // The starting season: "auto" or a season.
  season: string;
};

// The game's choices. Coverage and map sizes past the usual ones only appear
// in the game's development mode.
export const COVERAGES = [30, 50, 100];
export const DEV_COVERAGES = [5];
export const MAP_SIZES = [200, 225, 250, 275, 300, 325];
export const DEV_MAP_SIZES = [350, 400];
export const SEASONS = ["auto", "spring", "summer", "fall", "winter"];
// The sliders: seven steps, the middle one the game's normal.
export const SLIDER_STEPS = 7;
export const SLIDER_NORMAL = 3;
export const POLLUTION_STEP = 5;
// Past this side the game warns that the map breaks its design.
export const LARGE_MAP = 280;

export const DEFAULTS: Settings = {
  // Our own example seed; the game draws a random one.
  seed: "rimworld",
  // The game's default with Odyssey.
  coverage: 50,
  rainfall: SLIDER_NORMAL,
  temperature: SLIDER_NORMAL,
  population: SLIDER_NORMAL,
  landmarks: SLIDER_NORMAL,
  // The game's default with Biotech.
  pollution: 5,
  tile: null,
  size: 250,
  season: "auto",
};

const NUMBERS = [
  "coverage",
  "rainfall",
  "temperature",
  "population",
  "landmarks",
  "pollution",
  "size",
] as const;

// The settings from a page's address; a missing value takes the default.
export function readSettings(params: URLSearchParams): Settings {
  const out: Settings = { ...DEFAULTS };
  out.seed = params.get("seed") ?? DEFAULTS.seed;
  for (const name of NUMBERS) {
    const value = Number(params.get(name));
    if (params.has(name) && Number.isFinite(value)) {
      out[name] = value;
    }
  }
  const tile = Number(params.get("tile"));
  out.tile = params.has("tile") && Number.isInteger(tile) ? tile : null;
  const season = params.get("season");
  out.season = season && SEASONS.includes(season) ? season : DEFAULTS.season;
  return out;
}

// The address of the settings: only what differs from the default.
export function settingsQuery(s: Settings): string {
  const params = new URLSearchParams();
  params.set("seed", s.seed);
  for (const name of NUMBERS) {
    if (s[name] !== DEFAULTS[name]) {
      params.set(name, String(s[name]));
    }
  }
  if (s.tile !== null) {
    params.set("tile", String(s.tile));
  }
  if (s.season !== DEFAULTS.season) {
    params.set("season", s.season);
  }
  return params.toString();
}

// The generator's key: one setting a line, in the order it reads them.
export function generatorKey(s: Settings): string {
  return [
    s.seed,
    s.coverage,
    s.temperature,
    s.rainfall,
    s.population,
    s.landmarks,
    s.pollution,
    s.tile ?? 0,
    s.size,
  ].join("\n");
}

// The RimWorld generator built to WebAssembly, beside its glue.
export const WASM_PATH = `${BASE_PATH}/wasm/rimworld.js`;
