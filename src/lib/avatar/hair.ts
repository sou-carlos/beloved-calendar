/** Hairstyles: hand-drawn 32-grid art doubled to 64, plus coils and locs drawn natively at 64. */
import { ART, SIZE, ascii, blankAt, contour, hiRes, indices, mask, noise, rowsOf, sym, wave, type Grid, type Ramp, type Span } from "./grid";

export interface HairLayer {
  tones: Grid;
  /** Keeps a back layer at full brightness, for hair that continues seamlessly into the front layer. */
  keepBright?: boolean;
}
export interface HairStyle {
  id: string;
  label: string;
  front?: HairLayer;
  back?: HairLayer;
}

// A contour supplies volume and a softer edge toward the top-left light. All interior
// clumps, gaps, underside shadows, and curved glints are placed in the tone artwork below.
export type HairStroke = [x: number, y: number, lines: string[]];
export function hair(shape: Grid, strokes: HairStroke[] = []): HairLayer {
  const tones = contour(shape, "2");
  for (const [left, top, lines] of strokes)
    lines.forEach((line, dy) => Array.from(line).forEach((key, dx) => {
      const x = left + dx;
      const y = top + dy;
      if (x >= 0 && x < ART && y >= 0 && y < ART && tones[y][x] !== "." && key !== ".") tones[y][x] = key;
    }));
  return { tones: hiRes(tones, "O") };
}

// Shared crown silhouettes. Each style has its own hand-placed clumps over these shapes.
export const CROWN: Record<number, Span[]> = {
  1: [[11, 20]],
  2: [[9, 22]],
  3: [[8, 23]],
  4: [[7, 24]],
  5: [[6, 25]],
  6: [[6, 25]],
};

export const SHORT = ascii([
  "...........#....#....#..........",
  "..........##...###..###.........",
  ".........##########.####........",
  "........#################.......",
  ".......###################......",
  "......#####################.....",
  ".....######################.....",
  ".....#######################....",
  ".....########################...",
  ".....#####...################...",
  ".....####......###############..",
  "......##.........############...",
  "......##............########....",
  ".......#...............####.....",
  "..........................##....",
]);

export const longFrontSides = (from: number, to: number, w: (y: number) => number) =>
  rowsOf(from, to, (y) => {
    const widen = y > 23 ? 1 : 0;
    return [[4 + w(y) - widen, 8 + widen], [23 - widen, 27 - w(y) + widen]];
  });
export const PARTED_TOP: Record<number, Span[]> = {
  ...CROWN,
  7: [[5, 12], [17, 26]],
  8: [[5, 10], [19, 26]],
  9: [[5, 9], [21, 26]],
  10: [[5, 8], [22, 26]],
};
export const PULLED_BACK: Record<number, Span[]> = {
  2: [[12, 19]],
  3: [[9, 22]],
  4: [[7, 24]],
  5: [[6, 25]],
  6: [[6, 25]],
  7: [[6, 25]],
  8: [[6, 9], [22, 25]],
  9: [[6, 8], [23, 25]],
  10: [[6, 7], [24, 25]],
  11: [[6, 7], [24, 24]],
};

export const sweptCrown: HairStroke[] = [
  [10, 2, ["..3444....", ".34555444.", "3444334554", "4432223444"]],
  [6, 5, ["..344455433333..", ".34554443333333.", "1344432223344443", "12221....2334444"]],
  [17, 6, ["..23444", ".234443", "1234432", ".122321"]],
];
export const partedCrown: HairStroke[] = [
  [8, 2, ["..3444..223444", ".345544.2345544", "345544322345444", "4433221.1233443"]],
  [6, 5, ["..444332...234443", ".3454321...234433", "1343321.....22332"]],
];
export const pulledCrown: HairStroke[] = [
  [10, 3, ["..344444..", ".345554443", "34444334443", "44332234443"]],
  [7, 6, ["23444333333334443", "12333322222233432", ".1221..........1221"]],
];

export const WAVY_BACK: HairStroke[] = [
  [3, 14, ["234443", "344432", "443321", "332211", "223344", "234454", "344443", "443321", "332211", "223344", "234454", "344443", "443321", "332211", "223344", "234454"]],
  [23, 14, ["344432", "443321", "332211", "223344", "234454", "344443", "443321", "332211", "223344", "234454", "344443", "443321", "332211", "223344", "234454", "344443"]],
];
export const WAVY_FRONT: HairStroke[] = [
  ...partedCrown,
  [4, 11, ["23443", "34543", "44532", "43321", "32221", "23443", "34543", "44532", "43321", "32221", "23443", "34543", "44532", "43321", "32221", "23443", "34543", "44532", "43321", "32221", "12221"]],
  [23, 11, ["34432", "44532", "44321", "33221", "22332", "34432", "44532", "44321", "33221", "22332", "34432", "44532", "44321", "33221", "22332", "34432", "44532", "44321", "33221", "22332", "12221"]],
];
export const wavyBack = (bottom: number) => rowsOf(5, bottom, (y) => {
  const w = y < 9 ? 0 : wave(y + 2);
  const half = y < 9 ? 10 + (y - 5) : 12 + Math.min(2, Math.floor((y - 9) / 4));
  return [[15 - half - w, 16 + half + w]];
});

/**
 * Tight coils over a round volume, drawn natively on the 64 grid: lit toward the top left of the
 * sphere, darker toward the bottom right, with small coil bumps and scattered specks. The shape and
 * the light are given in 32-grid units. "all" outlines the whole silhouette, "hairline" outlines
 * only where the hair meets the face below, so it blends into a back layer.
 */
export function coils(
  shape: (x: number, y: number) => boolean,
  center: [number, number],
  radius: number,
  edges: "all" | "hairline",
): HairLayer {
  const ramp = ["1", "2", "3", "4", "5"];
  const at = (x: number, y: number) => shape((x + 0.5) / 2 - 0.5, (y + 0.5) / 2 - 0.5);
  const outside = (x: number, y: number) => y < SIZE && !at(x, y);
  const tones = blankAt(SIZE);
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      if (!at(x, y)) continue;
      if (outside(x, y + 1) || (edges === "all" && outside(x + 1, y))) {
        tones[y][x] = "O";
        continue;
      }
      if (edges === "all" && (outside(x - 1, y) || outside(x, y - 1))) {
        tones[y][x] = "2";
        continue;
      }
      const lit = Math.hypot(x / 2 - (center[0] - radius * 0.35), y / 2 - (center[1] - radius * 0.45)) / radius;
      let tone = lit < 0.5 ? 3 : lit < 1 ? 2 : 1;
      const cellX = (x + (Math.floor(y / 3) % 2)) % 3;
      const cellY = y % 3;
      if (cellX === 0 && cellY === 0) tone += 1;
      else if (cellX === 2 && cellY === 2) tone -= 1;
      const speck = noise(x, y);
      if (speck === 0) tone -= 1;
      else if (speck === 1) tone += 1;
      tones[y][x] = ramp[Math.max(0, Math.min(4, tone))];
    }
  return { tones };
}
export const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= (noise(Math.round(x * 2), Math.round(y * 2)) === 0 ? 0.92 : 1);

/**
 * Dreads as tubes drawn natively on the 64 grid. Each loc follows a Bézier curve (3 or 4 points,
 * 64-grid units). Across its width it is lit on the side facing the top-left light and dark on the
 * other, with twist grooves along its length, optional gold cuffs and a curled tip.
 */
export type Point = [number, number];
export interface Loc {
  points: Point[];
  /** Positions along the loc, 0 at the root and 1 at the tip, that get a gold cuff. */
  cuffs?: number[];
  width?: number;
  /** Straight hair: no twist grooves, so overlapping strands read as smooth locks. */
  smooth?: boolean;
}
export const bezier = (points: Point[], t: number): Point => {
  if (points.length === 1) return points[0];
  const next = points.slice(1).map((point, i): Point => [
    points[i][0] + (point[0] - points[i][0]) * t,
    points[i][1] + (point[1] - points[i][1]) * t,
  ]);
  return bezier(next, t);
};
export function drawLocs(tones: Grid, list: Loc[]) {
  list.forEach((loc, index) => {
    const radius = (loc.width ?? 3.2) / 2;
    const [start, end] = [loc.points[0], loc.points[loc.points.length - 1]];
    const steps = Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) * 4) + 12;
    let travelled = 0;
    let previous = bezier(loc.points, 0);
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const point = bezier(loc.points, t);
      const ahead = bezier(loc.points, Math.min(1, t + 0.01));
      const behind = bezier(loc.points, Math.max(0, t - 0.01));
      travelled += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
      previous = point;
      let [nx, ny] = [-(ahead[1] - behind[1]), ahead[0] - behind[0]];
      const length = Math.hypot(nx, ny) || 1;
      [nx, ny] = [nx / length, ny / length];
      if (nx + ny > 0) [nx, ny] = [-nx, -ny]; // normal points toward the top-left light
      const cuff = loc.cuffs?.some((c) => Math.abs(c - t) < 0.035);
      const groove = !loc.smooth && (travelled + index * 1.7) % 4 < 1;
      const tip = t > 0.94;
      for (let y = Math.floor(point[1] - radius - 1); y <= point[1] + radius + 1; y++)
        for (let x = Math.floor(point[0] - radius - 1); x <= point[0] + radius + 1; x++) {
          if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue;
          const [dx, dy] = [x + 0.5 - point[0], y + 0.5 - point[1]];
          if (dx * dx + dy * dy > radius * radius) continue;
          const side = dx * nx + dy * ny;
          tones[y][x] = cuff
            ? (side > 0 ? "g" : "G")
            : side < -radius * 0.45 ? "O"
            : tip ? "2"
            : side > radius * 0.45 ? (travelled % 7 < 2 ? "5" : "4")
            : groove ? "2"
            : "3";
        }
    }
  });
}
/** A scalp mask from 32-grid rows, filled with the darkest hair tone so gaps between locs read as depth. */
export function scalp(rows: Record<number, Span[]>, fill = "1"): Grid {
  return hiRes(mask(rows)).map((row) => row.map((key) => (key === "." ? "." : fill)));
}
/** Faded short sides: stubble that thins out toward the bottom, drawn on the 64 grid. */
export function fade(tones: Grid, from: number, to: number, top: number, bottom: number) {
  for (let y = top; y <= bottom; y++)
    for (let x = from; x <= to; x++) {
      const density = 1 - (y - top) / (bottom - top + 1);
      if (tones[y][x] === "." && noise(x, y) < density * 9) tones[y][x] = noise(x + 1, y) < 4 ? "1" : "2";
    }
}
export const locLayer = (base: Grid, list: Loc[]): HairLayer => {
  const tones = base.map((row) => [...row]);
  drawLocs(tones, list);
  return { tones };
};

export const HAIR_STYLES: HairStyle[] = [
  { id: "bald", label: "Careca" },
  {
    id: "buzz", label: "Raspado",
    front: hair(mask({
      3: [[11, 20]], 4: [[9, 22]], 5: [[8, 23]],
      6: [[7, 24]], 7: [[7, 24]], 8: sym(7, 10), 9: sym(7, 8), 10: sym(7, 7),
    }), [
      [10, 4, [".344444443", "34554444433", "443333333322", "222222222222"]],
    ]),
  },
  {
    id: "short", label: "Curto",
    front: hair(SHORT, [
      [10, 1, ["..45...45..", ".3454.34454", "34443344443"]],
      ...sweptCrown,
      [6, 8, ["12221", ".121", ".11"]],
      [22, 9, ["223443", ".23443", "..223", "...12"]],
    ]),
  },
  {
    id: "quiff", label: "Topete",
    front: hair(mask({
      0: [[13, 15], [20, 21]], 1: [[10, 17], [19, 23]], 2: [[8, 25]], 3: [[7, 26]],
      4: [[6, 26]], 5: [[6, 26]], 6: [[5, 26]], 7: [[5, 26]],
      8: [[5, 11], [18, 26]], 9: [[5, 9], [22, 26]],
      10: [[6, 8], [23, 25]], 11: [[6, 7], [24, 25]], 12: [[7, 7], [24, 24]],
    }), [
      [9, 1, ["..34444...344", ".34555443345544", "345554443344544", "445443322334443"]],
      [7, 4, ["..34444455544443", ".345543344444443", "34443222333333443", "33221....22222332"]],
      [20, 4, ["2344443", "1234443", ".123332", "..12221"]],
    ]),
  },
  {
    id: "spiky", label: "Espetado",
    front: hair(mask({
      0: [[7, 7], [12, 13], [19, 19], [24, 24]],
      1: [[7, 8], [11, 14], [18, 20], [23, 24]],
      2: [[6, 9], [10, 15], [17, 21], [22, 25]],
      3: [[6, 25]], 4: [[5, 26]], 5: [[4, 27]], 6: [[4, 27]],
      7: [[5, 26]], 8: [[5, 26]],
      9: [[5, 8], [10, 12], [14, 17], [19, 21], [23, 26]],
      10: [[5, 7], [11, 11], [15, 16], [20, 20], [24, 26]],
      11: sym(6, 7), 12: sym(6, 7),
    }), [
      [6, 1, ["4....45....4....4", "44...455...44...44", "344.34554.3444.344", "333434433434433433"]],
      [5, 5, ["234444332344433444322", "123443221344322344321", "122332..12232..123321"]],
      [10, 8, ["12.344.12.344", "..123...122"]],
    ]),
  },
  {
    id: "bangs", label: "Franja",
    front: hair(mask({
      ...CROWN, 7: [[5, 26]], 8: [[5, 26]], 9: [[5, 26]],
      10: [[5, 25]], 11: [[5, 23], [25, 26]],
      12: [[5, 7], [9, 11], [14, 15], [18, 20], [23, 26]],
      13: sym(4, 7), 14: sym(4, 7), 15: sym(4, 7), 16: sym(4, 7),
      17: sym(5, 7),
    }), [
      [8, 2, ["..3455443...", ".34554443344", "3454332345544", "4433221344433"]],
      [6, 6, ["2344443333444433444", "1345544322345544433", "1234443211234443221", ".1223321..1223321"]],
      [8, 10, ["44321.3443.3443", "321...233..233"]],
      [4, 12, ["2344", "1443", "1233", ".122"]],
      [23, 12, ["2334", "1233", "1222", ".11"]],
    ]),
  },
  {
    id: "curly", label: "Cacheado",
    front: hair(mask({
      0: [[9, 11], [15, 18], [22, 23]], 1: [[7, 13], [14, 19], [21, 25]], 2: [[6, 25]],
      3: [[5, 26]], 4: [[4, 12], [14, 27]], 5: [[4, 27]], 6: [[3, 27]],
      7: [[4, 28]], 8: [[4, 10], [12, 17], [19, 27]],
      9: [[4, 9], [12, 15], [18, 20], [23, 27]],
      10: [[4, 8], [23, 27]], 11: sym(5, 7), 12: sym(5, 7),
      13: [[6, 6], [25, 25]],
    }), [
      [6, 1, [".3444..344....344", "345554345543.34554", "454332443321344443", "443221233221233322"]],
      [4, 4, ["..34554....34554...344", ".345443..345443..34554", "3443321.3443321.34443", "443221..443221..44332", "32211.234432.2333321"]],
      [4, 9, ["23443", "12332", ".122"]],
      [23, 9, ["23443", "12332", ".122"]],
    ]),
  },
  {
    id: "afro", label: "Black power",
    // A wide round halo behind the head that frames the face down to the jaw, and a matching
    // front layer that covers the skull with a soft rounded hairline.
    back: { ...coils((x, y) => inEllipse(x, y, 15.5, 11, 15.4, 12.4), [15.5, 11], 15, "all"), keepBright: true },
    front: coils((x, y) => {
      if (!inEllipse(x, y, 15.5, 11, 15.4, 12.4) || x < 5 || x > 26 || y > 10) return false;
      return y <= 7 || x <= 9 - (y - 8) || x >= 22 + (y - 8);
    }, [15.5, 11], 15, "hairline"),
  },
  {
    id: "coily", label: "Crespo médio",
    front: coils((x, y) => {
      if (!inEllipse(x, y, 15.5, 8, 11.6, 8.6) || y > 12) return false;
      if (y >= 10) return x <= 7 || x >= 24;
      if (y >= 8) return x <= 9 - (y - 8) || x >= 22 + (y - 8);
      return true;
    }, [15.5, 6], 11, "all"),
  },
  {
    id: "coily-short", label: "Crespo curto",
    front: coils((x, y) => {
      if (!inEllipse(x, y, 15.5, 8.5, 9.8, 6.4) || y > 10) return false;
      return y <= 7 || x <= 8 || x >= 23;
    }, [15.5, 6], 9, "all"),
  },
  {
    // Two coily puffs high on the head, a coily hairline and loose curls at the temples.
    id: "puffs", label: "Pompons",
    front: (() => {
      const layer = coils((x, y) => {
        if (!inEllipse(x, y, 15.5, 8, 10.4, 6.4) || y > 10) return false;
        return y <= 7 || x <= 8 - (y - 8) || x >= 23 + (y - 8);
      }, [15.5, 6], 10, "all");
      // Each puff is its own round volume, outlined against the hairline and the other puff.
      for (const cx of [7.5, 23.5]) {
        const puff = coils((x, y) => inEllipse(x, y, cx, 4.5, 6.4, 5.6), [cx, 4.5], 6.5, "all");
        puff.tones.forEach((row, y) => row.forEach((key, x) => key !== "." && (layer.tones[y][x] = key)));
      }
      drawLocs(layer.tones, [
        { width: 1.8, points: [[14, 22], [9, 28], [15, 33], [9, 38], [13, 44]] },
        { width: 1.8, points: [[49, 22], [54, 28], [48, 33], [54, 38], [50, 44]] },
      ]);
      return layer;
    })(),
  },
  {
    // Faded sides and a crest of smooth spikes along the middle.
    id: "mohawk", label: "Moicano",
    front: (() => {
      const base = scalp({ ...rowsOf(3, 8, () => [[13, 18]]) }, "2");
      fade(base, 15, 26, 8, 26);
      fade(base, 37, 48, 8, 26);
      return locLayer(base, indices(8).map((i): Loc => {
        const rx = 26 + i * 1.6;
        const lean = (i % 2 ? 1 : -1) * (2 + (i % 3));
        return { smooth: true, width: 4.4, points: [[rx, 16 - (i % 3)], [rx + lean * 0.4, 7], [rx + lean, -2 + (i % 4)]] };
      }));
    })(),
  },
  {
    // Side part, a swept fringe and ends that flip out at the jaw.
    id: "straight-short", label: "Liso curto",
    back: locLayer(scalp({ ...rowsOf(6, 19, () => [[6, 25]]), 20: [[7, 24]] }, "3"), [
      ...indices(3).map((i): Loc => ({ smooth: true, width: 4.4, points: [[14 - i * 2, 16], [11 - i * 2, 30], [9 - i, 40]] })),
      ...indices(3).map((i): Loc => ({ smooth: true, width: 4.4, points: [[50 + i * 2, 16], [53 + i * 2, 30], [55 - i, 40]] })),
    ]),
    front: locLayer(scalp({ 2: [[11, 20]], 3: [[9, 22]], 4: [[8, 23]], 5: [[7, 24]], 6: [[7, 24]] }, "3"), [
      ...indices(4).map((i): Loc => ({
        smooth: true,
        width: 4.2,
        points: [[23 - i * 3, 8 + i], [15 - i * 2, 13], [12 - i * 1.5, 30], [11 - i, 40], [7 - i, 38]],
      })),
      ...indices(5).map((i): Loc => ({
        smooth: true,
        width: 4.2,
        points: [[25 + i * 3, 7 + (i % 2)], [38 + i * 2.5, 5 + i], [47 + i * 1.5, 18 + i], [50 + i, 37 + (i % 2) * 2], [56 + i * 0.5, 35]],
      })),
      ...indices(3).map((i): Loc => ({ smooth: true, width: 4, points: [[24 + i * 2, 9], [32 + i * 3, 12], [41 + i * 2, 19 + i]] })),
    ]),
  },
  {
    // Faded sides with locs rising from the top and flopping forward.
    id: "dreads", label: "Dread degradê",
    front: (() => {
      const base = scalp({ 3: [[10, 21]], 4: [[9, 22]], 5: [[8, 23]], 6: [[8, 23]], 7: [[8, 23]] });
      fade(base, 14, 20, 12, 30);
      fade(base, 43, 49, 12, 30);
      return locLayer(base, [
        ...indices(9).map((i): Loc => {
          const rx = 17 + i * 3.6;
          const ry = 10 + ((rx - 32) / 16) ** 2 * 4;
          return {
            width: 2.8,
            points: [[rx, ry], [rx + 0.5, ry - 10 - (i % 3) * 2], [rx + 5, ry - 15 + (i % 2) * 2], [rx + 9, ry - 9 + (i % 3) * 2]],
          };
        }),
        ...indices(3).map((i): Loc => ({ width: 2.8, points: [[24 + i * 7, 13], [29 + i * 7, 7], [36 + i * 6, 13 + i * 2]] })),
      ]);
    })(),
  },
  {
    // Side-parted locs sweeping across the forehead and down one side to the neck, curled tips and gold cuffs.
    id: "dreads-bob", label: "Dread curto",
    back: locLayer(blankAt(SIZE), [
      ...indices(3).map((i): Loc => ({ width: 2.8, points: [[12 - i * 3, 20], [8 - i * 3, 34], [10 - i * 3, 46 - i * 2]] })),
      ...indices(3).map((i): Loc => ({ width: 2.8, points: [[52 + i * 3, 22], [57 + i * 2, 34], [55 + i * 3, 46 - i * 2]] })),
    ]),
    front: locLayer(scalp({ 2: [[11, 20]], 3: [[9, 22]], 4: [[8, 23]], 5: [[7, 24]], 6: [[7, 24]] }), [
      ...indices(4).map((i): Loc => {
        const end: Point = [14 - i * 3 + (i % 2) * 2, 44 + (i % 3) * 2];
        return {
          width: 2.8,
          points: [[22 - i * 3, 9 + i], [14 - i * 2.5, 16], [12 - i * 2.5, 30], end, [end[0] + 3, end[1] - 1]],
          cuffs: i === 1 ? [0.5] : undefined,
        };
      }),
      ...indices(7).map((i): Loc => {
        const end: Point = [46 + i * 2.2 - (i % 2) * 2, 38 + (i % 3) * 4 + i];
        return {
          width: 2.8,
          points: [[24 + i * 1.5, 8 + (i % 2)], [36 + i * 2, 1 + i * 1.5], [50 + i * 1.5, 12 + i * 2], end, [end[0] - 3, end[1] - 1]],
          cuffs: i === 2 ? [0.3] : i === 5 ? [0.6] : undefined,
        };
      }),
    ]),
  },
  {
    // Long locs with a middle part and a few looped up on the crown, framing the face past the shoulders.
    id: "locs", label: "Dread longo",
    back: locLayer(blankAt(SIZE), [
      ...indices(4).map((i): Loc => ({ points: [[14 - i * 2, 16], [6 - i, 36], [10 - i * 2, 63]] })),
      ...indices(4).map((i): Loc => ({ points: [[49 + i * 2, 16], [57 + i, 36], [53 + i * 2, 63]] })),
    ]),
    front: locLayer(scalp({ 2: [[11, 20]], 3: [[9, 22]], 4: [[8, 23]], 5: [[7, 24]], 6: [[7, 24]] }), [
      ...indices(3).map((i): Loc => ({ points: [[27 + i * 4, 10], [22 + i * 5, -1], [36 + i * 3, 1], [33 + i * 3, 9]] })),
      ...indices(6).map((i): Loc => ({
        points: [[30 - i * 3, 9 + i], [18 - i * 2, 14], [12 - i * 1.5 + (i % 2) * 3, 38], [10 - i + (i % 2) * 2, 63]],
        cuffs: i === 2 ? [0.4] : undefined,
      })),
      ...indices(6).map((i): Loc => ({
        points: [[33 + i * 3, 9 + i], [45 + i * 2, 14], [51 + i * 1.5 - (i % 2) * 3, 38], [53 + i - (i % 2) * 2, 63]],
      })),
    ]),
  },
  {
    id: "bob", label: "Chanel",
    back: hair(mask(rowsOf(11, 22, (y) => y > 20 ? [[5, 25]] : [[4, 27]])), [
      [5, 13, ["23443", "23443", "23443", "23443", "23332", "22332", "12221", "12221"]],
      [23, 13, ["23332", "23332", "23332", "23332", "23332", "22221", "12221", "12221"]],
    ]),
    front: hair(mask({
      ...CROWN, 7: [[5, 26]], 8: [[5, 26]], 9: [[5, 26]],
      10: [[4, 27]], 11: [[4, 9], [10, 13], [16, 18], [22, 27]],
      ...rowsOf(12, 19, () => sym(4, 7)), 20: sym(4, 8), 21: sym(5, 9),
    }), [
      ...partedCrown,
      [4, 10, ["23444", "13454", "13443", "13443", "13443", "13443", "13332", "12221", "12221", ".122"]],
      [23, 10, ["34443", "34432", "34432", "33321", "33321", "33321", "23321", "22221", "12221", ".122"]],
      [10, 8, ["3432", "3321", "221"]],
    ]),
  },
  {
    id: "long", label: "Longo liso",
    back: hair(mask(rowsOf(5, 31, (y) => [[y < 9 ? 6 : 4, y < 9 ? 25 : 27]])), [
      [5, 13, ["2333", "2333", "2343", "2343", "2343", "2343", "2343", "2343", "2333", "2333", "2333", "2333", "2333", "2333", "2333", "2333", "1222"]],
      [23, 13, ["2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "2332", "1221"]],
    ]),
    front: hair(mask({ ...PARTED_TOP, ...longFrontSides(11, 31, () => 0) }), [
      ...partedCrown,
      [4, 11, ["23443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "13443", "12221", "12221", "12221"]],
      [23, 11, ["34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "34432", "12221", "12221", "12221", "12221"]],
    ]),
  },
  {
    id: "wavy", label: "Longo ondulado",
    back: hair(mask(wavyBack(31)), WAVY_BACK),
    front: hair(mask({ ...PARTED_TOP, ...longFrontSides(11, 31, wave) }), WAVY_FRONT),
  },
  {
    id: "wavy-short", label: "Ondulado curto",
    back: hair(mask({ ...wavyBack(20), 21: [[4, 27]] }), WAVY_BACK),
    front: hair(mask({ ...PARTED_TOP, ...longFrontSides(11, 21, wave) }), [
      ...WAVY_FRONT,
      [4, 20, ["12221", ".122"]],
      [23, 20, ["12221", "122."]],
    ]),
  },
  {
    id: "ponytail", label: "Rabo de cavalo",
    back: hair(mask({
      5: [[22, 27]], 6: [[22, 27]], 7: [[23, 28]],
      8: [[25, 29]], 9: [[25, 29]], 10: [[26, 30]],
      ...rowsOf(11, 24, (y) => [[26 + wave(y), 29 + wave(y)]]),
      25: [[27, 29]], 26: [[27, 29]], 27: [[28, 29]],
    }), [
      [25, 8, ["2344", "34443", "44332", "33221", "22344", "23443", "34432", "44321", "33221", "22344", "23443", "34432", "44321", "33221", "22344", "23443", "34432", "1221"]],
    ]),
    front: hair(mask(PULLED_BACK), [
      ...pulledCrown,
      [6, 8, ["2332", "1221", "1221"]],
      [22, 8, ["2332", "1221", "1221"]],
    ]),
  },
  {
    id: "bun", label: "Coque",
    front: hair(mask({
      ...PULLED_BACK,
      0: [[13, 18]], 1: [[11, 20]], 2: [[10, 21]],
      3: [[10, 21]], 4: [[7, 24]],
    }), [
      [11, 0, ["..3444", ".3455544", "3444433434", "4433222233"]],
      [10, 4, ["111111111111", "234443334444", "344443333444", "443332223334"]],
      [6, 8, ["2332", "1221", "1221"]],
      [22, 8, ["2332", "1221", "1221"]],
    ]),
  },
  {
    id: "pigtails", label: "Maria-chiquinha",
    back: hair(mask({
      9: sym(2, 6), 10: sym(2, 6),
      ...rowsOf(11, 24, (y) => sym(1 + wave(y), 5 + wave(y))),
      25: sym(2, 4),
    }), [
      [1, 10, ["23443", "34543", "44532", "43321", "32221", "23443", "34543", "44532", "43321", "32221", "23443", "34543", "44532", "43321", "1221"]],
      [26, 10, ["34432", "44532", "44321", "33221", "22332", "34432", "44532", "44321", "33221", "22332", "34432", "44532", "44321", "33221", "1221"]],
    ]),
    front: hair(mask({ ...PARTED_TOP, 11: sym(5, 7), 12: sym(5, 6) }), [
      ...partedCrown,
      [5, 8, ["2344", "1233", "1221"]],
      [23, 8, ["3443", "2332", "1221"]],
    ]),
  },
  {
    id: "braids", label: "Tranças",
    front: hair(mask({
      ...PARTED_TOP, 11: sym(5, 8),
      ...rowsOf(12, 29, (y) => y % 4 === 0 ? sym(3, 8) : sym(4, 8)),
      30: sym(5, 7),
    }), [
      ...partedCrown,
      [4, 11, ["23443", "34543", "44532", "33221", "22343", "34443", "44332", "33221", "22343", "34443", "44332", "33221", "22343", "34443", "44332", "33221", "22343", "34443", "12221"]],
      [23, 11, ["34432", "44532", "44321", "33221", "23342", "34443", "44332", "33221", "23342", "34443", "44332", "33221", "23342", "34443", "44332", "33221", "23342", "34443", "12221"]],
    ]),
  },
];

/** Tone keys of a hair layer, one step darker when dim is set, for hair behind the head. */
export function dimTones(layer: HairLayer, dim = false): Grid {
  const lowered: Ramp = { "5": "4", "4": "3", "3": "2", "2": "1" };
  return layer.tones.map((row) => row.map((key) => dim ? lowered[key] || key : key));
}
