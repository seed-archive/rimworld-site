// The colours of the RimWorld generator's test classes, by palette index
// (0 is nothing). The classes are a stand-in pattern, so the colours are our
// own choice, picked to read as the biomes and terrain they stand for.
type Rgb = [number, number, number];

// The planet's biomes.
export const PALETTE: Rgb[] = [
  [0, 0, 0],
  [38, 74, 120],
  [70, 120, 160],
  [232, 238, 242],
  [150, 160, 140],
  [62, 96, 70],
  [92, 132, 74],
  [190, 168, 112],
  [40, 110, 60],
];

// A colony map's terrain: deep and shallow water, marsh, sand, soil, rich
// soil, gravel, ice, rock.
export const TERRAIN_PALETTE: Rgb[] = [
  [0, 0, 0],
  [36, 70, 112],
  [74, 122, 158],
  [92, 104, 72],
  [214, 196, 146],
  [128, 104, 72],
  [88, 70, 46],
  [150, 142, 128],
  [226, 234, 240],
  [96, 94, 92],
];

// A palette as the viewers take it: 256 RGBA entries, index 0 transparent.
export function rgba(palette: Rgb[]): Uint8ClampedArray {
  const out = new Uint8ClampedArray(256 * 4);
  palette.forEach(([r, g, b], i) => out.set([r, g, b, i ? 255 : 0], i * 4));
  return out;
}
