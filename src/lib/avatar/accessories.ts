/** Hats, earrings, glasses and beards. */
import { SIZE, blankAt, hiRes, noise, paintRows, plot, range, type Grid, type KeyedSpan, type Ramp } from "./grid";
import { FELT } from "./palettes";
import { HEAD_64 } from "./face";

// Accessories. Each option has its art, the colors it uses and, for hats, the area of hair it hides.
// Keys: O outline, 1 light, 2 shadow, 3 base, b band. Hats other than straw take the shirt's colors.
export interface Accessory {
  id: string;
  label: string;
  art?: Grid;
  /** Art drawn natively on the 64 grid, used as is. */
  art64?: Grid;
  /** Fixed colors. Without them, hats take the shirt's colors. */
  ramp?: Ramp;
  /** Hair down to this row is hidden under the hat, then it comes back gradually below the brim. */
  clip?: number;
}

/** The same pixels on both ears: x is given for the left ear and mirrored for the right one. */
export const bothEars = (points: [number, number, string][]): Grid =>
  plot(points.flatMap(([x, y, key]): [number, number, string][] => [[x, y, key], [SIZE - 1 - x, y, key]]));
export const ring = (cx: number, cy: number, r: number): [number, number, string][] =>
  range(0, 39).map((i) => {
    const a = (i / 40) * Math.PI * 2;
    return [Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), Math.sin(a) < 0 ? "g" : "G"];
  });

export const none = { id: "none", label: "Nenhum" };
export const weave = (y: number, from: number, to: number): KeyedSpan[] =>
  range(from, to).filter((x) => (x + y) % 3 === 0).map((x) => [x, x, "2"]);

export const HATS: Accessory[] = [
  none,
  {
    id: "straw",
    label: "Chapéu de palha",
    clip: 7,
    art: paintRows({
      0: [[10, 21, "O"]],
      ...Object.fromEntries(range(1, 4).map((y) => [y, [[9, 9, "O"], [10, 11, "1"], [12, 20, "3"], ...weave(y, 12, 20), [21, 21, "2"], [22, 22, "O"]]])),
      5: [[9, 9, "O"], [10, 21, "b"], [22, 22, "O"]],
      6: [[3, 3, "O"], [4, 27, "1"], [28, 28, "O"]],
      7: [[3, 3, "O"], [4, 27, "3"], ...weave(7, 5, 26), [28, 28, "O"]],
      8: [[2, 3, "O"], [4, 27, "2"], [28, 29, "O"]],
      9: [[4, 27, "O"], ...range(4, 27).filter((x) => x % 4 === 1).map((x): KeyedSpan => [x, x, "2"])],
    }),
  },
  {
    id: "cap",
    label: "Boné",
    clip: 10,
    art: paintRows({
      2: [[10, 21, "O"]],
      3: [[8, 8, "O"], [9, 10, "1"], [11, 22, "3"], [15, 16, "2"], [23, 23, "O"]],
      ...Object.fromEntries(range(4, 6).map((y) => [y, [[7, 7, "O"], [8, 9, "1"], [10, 22, "3"], [23, 23, "2"], [24, 24, "O"]]])),
      7: [[6, 6, "O"], [7, 8, "1"], [9, 24, "3"], [25, 25, "O"]],
      8: [[6, 6, "O"], [7, 24, "b"], [25, 25, "O"]],
      9: [[5, 5, "O"], [6, 25, "2"], [26, 26, "O"]],
      10: [[6, 25, "O"]],
    }),
  },
  {
    id: "beanie",
    label: "Gorro",
    clip: 10,
    art: paintRows({
      0: [[14, 17, "1"]],
      1: [[11, 20, "O"], [14, 17, "1"]],
      2: [[9, 9, "O"], [10, 11, "1"], [12, 21, "3"], [22, 22, "O"]],
      3: [[8, 8, "O"], [9, 10, "1"], [11, 22, "3"], [23, 23, "O"]],
      ...Object.fromEntries(range(4, 6).map((y) => [y, [[7, 7, "O"], [8, 9, "1"], [10, 22, "3"], [23, 23, "2"], [24, 24, "O"]]])),
      ...Object.fromEntries(range(7, 9).map((y) => [y, [[6, 6, "O"], ...range(7, 24).map((x): KeyedSpan => [x, x, x % 2 ? "2" : "b"]), [25, 25, "O"]]])),
      10: [[6, 25, "O"]],
    }),
  },
  {
    id: "fedora",
    label: "Fedora",
    clip: 8,
    ramp: FELT,
    art: paintRows({
      0: [[11, 14, "O"], [17, 20, "O"]],
      1: [[10, 10, "O"], [11, 13, "1"], [14, 17, "2"], [18, 20, "3"], [21, 21, "O"]],
      ...Object.fromEntries(range(2, 4).map((y) => [y, [[9, 9, "O"], [10, 11, "1"], [12, 21, "3"], [21, 21, "2"], [22, 22, "O"]]])),
      5: [[9, 9, "O"], [10, 21, "b"], [22, 22, "O"]],
      6: [[5, 5, "O"], [6, 25, "1"], [26, 26, "O"]],
      7: [[4, 4, "O"], [5, 26, "3"], [27, 27, "O"]],
      8: [[5, 26, "O"]],
    }),
  },
  {
    id: "beret",
    label: "Boina",
    clip: 7,
    art: paintRows({
      1: [[17, 18, "O"]],
      2: [[11, 22, "O"]],
      3: [[8, 8, "O"], [9, 12, "1"], [13, 23, "3"], [24, 24, "O"]],
      4: [[6, 6, "O"], [7, 9, "1"], [10, 24, "3"], [25, 26, "O"]],
      5: [[5, 5, "O"], [6, 8, "1"], [9, 25, "3"], [26, 26, "2"], [27, 27, "O"]],
      6: [[6, 6, "O"], [7, 26, "2"], [27, 27, "O"]],
      7: [[7, 25, "O"]],
    }),
  },
  {
    id: "bandana",
    label: "Bandana",
    art: paintRows({
      6: [[7, 24, "O"]],
      7: [[6, 6, "O"], [7, 24, "3"], ...range(8, 23).filter((x) => x % 4 === 0).map((x): KeyedSpan => [x, x, "1"]), [25, 25, "O"]],
      8: [[6, 6, "O"], [7, 24, "2"], ...range(9, 23).filter((x) => x % 4 === 2).map((x): KeyedSpan => [x, x, "1"]), [25, 26, "O"]],
      9: [[7, 23, "O"], [24, 26, "3"], [27, 27, "O"]],
      10: [[25, 25, "3"], [26, 27, "2"], [28, 28, "O"]],
      11: [[26, 26, "O"], [27, 28, "O"]],
    }),
  },
  {
    // Flowers resting on the hair, like a festival crown.
    id: "flowers",
    label: "Coroa de flores",
    ramp: { O: "#3e5a24", 3: "#6a9a3a", 1: "#9ccc5a", p: "#f6a0c0", P: "#c8507a", y: "#ffe070", w: "#fff6ea" },
    art64: (() => {
      const points: [number, number, string][] = [];
      range(0, 7).forEach((i) => {
        const t = i / 7;
        const x = Math.round(12 + t * 40);
        const y = Math.round(16 - Math.sin(t * Math.PI) * 9);
        points.push([x - 3, y + 1, "3"], [x + 3, y + 1, "O"], [x - 2, y + 2, "1"]);
        const petal = i % 3 === 1 ? "w" : "p";
        const dark = i % 3 === 1 ? "P" : "P";
        for (const [dx, dy] of [[0, -2], [-2, 0], [2, 0], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) points.push([x + dx, y + dy, dy > 0 || dx > 1 ? dark : petal]);
        points.push([x, y, "y"]);
      });
      return plot(points);
    })(),
  },
];

export const EARRINGS: Accessory[] = [
  none,
  { id: "stud", label: "Ponto", art: paintRows({ 18: [[6, 6, "g"], [25, 25, "g"]] }) },
  {
    id: "hoop",
    label: "Argola",
    art: paintRows({
      18: [[6, 6, "g"], [25, 25, "g"]],
      19: [[5, 5, "g"], [7, 7, "G"], [24, 24, "g"], [26, 26, "G"]],
      20: [[6, 6, "G"], [25, 25, "G"]],
    }),
  },
  { id: "pearl", label: "Pérola", art64: bothEars([[12, 36, "p"], [13, 36, "p"], [12, 37, "p"], [13, 37, "P"]]) },
  { id: "big-hoop", label: "Argola grande", art64: bothEars(ring(12.5, 40, 4)) },
  {
    id: "drop",
    label: "Pingente",
    art64: bothEars([
      [12, 36, "g"], [12, 37, "G"], [12, 38, "G"], [12, 39, "g"],
      [12, 40, "e"], [11, 41, "e"], [12, 41, "e"], [13, 41, "E"], [12, 42, "E"],
    ]),
  },
  { id: "double", label: "Piercing duplo", art64: bothEars([[12, 36, "g"], [11, 29, "g"], [11, 30, "G"]]) },
];

export const BEARDS: Accessory[] = [
  none,
  { id: "mustache", label: "Bigode" },
  { id: "goatee", label: "Cavanhaque" },
  { id: "short", label: "Barba curta" },
  { id: "lumberjack", label: "Barba lenhador" },
];

export const lensSides = (): KeyedSpan[] => [[9, 9, "F"], [14, 14, "F"], [17, 17, "F"], [22, 22, "F"]];
export const glassesFrame = (round: boolean): Record<number, KeyedSpan[]> => ({
  12: round ? [[11, 12, "F"], [19, 20, "F"], [11, 11, "g"], [19, 19, "g"]] : [[9, 14, "F"], [17, 22, "F"], [10, 10, "g"], [18, 18, "g"]],
  13: [...lensSides(), [15, 16, "F"], [7, 8, "F"], [23, 24, "F"]],
  14: lensSides(),
  15: lensSides(),
  16: round ? [[11, 12, "F"], [19, 20, "F"]] : [[9, 14, "F"], [17, 22, "F"]],
});
export const GLASSES: Accessory[] = [
  none,
  { id: "round", label: "Redondo", art: paintRows(glassesFrame(true)) },
  { id: "square", label: "Quadrado", art: paintRows(glassesFrame(false)) },
  {
    id: "sun",
    label: "Escuro",
    art: (() => {
      const art = paintRows(glassesFrame(false));
      for (const y of [13, 14, 15]) for (const x of [10, 11, 12, 13, 18, 19, 20, 21]) art[y][x] = "S";
      art[13][10] = "g";
      art[13][18] = "g";
      return art;
    })(),
  },
];

export const byAccessory = (list: Accessory[], id: string | undefined) => list.find((item) => item.id === id) || list[0];

export const art64 = new Map<Accessory, Grid>();
export const accessoryArt = (item: Accessory, outline = "") => {
  if (item.art64) return item.art64;
  if (!item.art) return undefined;
  if (!art64.has(item)) art64.set(item, hiRes(item.art, outline));
  return art64.get(item);
};

/**
 * Beards drawn on the 64 grid over the jaw, in the hair's colors. The mouth stays visible.
 * Short beards leave gaps so skin shows through, the lumberjack beard grows past the chin.
 */
export const beard64 = new Map<string, Grid>();
export function beardArt(id: string): Grid | undefined {
  if (id === "none") return undefined;
  if (beard64.has(id)) return beard64.get(id);
  const onHead = (x: number, y: number) => HEAD_64[y]?.[x] !== undefined && HEAD_64[y][x] !== ".";
  const mouth = (x: number, y: number) => y >= 40 && y <= 41 && x >= 28 && x <= 35;
  const mustache = (x: number, y: number) =>
    (y === 37 && x >= 27 && x <= 36) || ((y === 38 || y === 39) && x >= 25 && x <= 38) || (y === 40 && (x === 24 || x === 25 || x === 38 || x === 39));
  const cheekTop = (x: number) => (x <= 19 || x >= 44 ? 32 : x <= 27 ? 32 + (x - 19) * 0.75 : x >= 36 ? 32 + (44 - x) * 0.75 : 38);
  const jaw = (x: number, y: number) => onHead(x, y) && y >= cheekTop(x) && y <= 47;
  const shapes: Record<string, (x: number, y: number) => boolean> = {
    mustache,
    goatee: (x, y) => mustache(x, y) || ((y === 40 || y === 41) && (x === 26 || x === 27 || x === 36 || x === 37)) || (y >= 42 && y <= 48 && x >= 26 + Math.max(0, y - 46) && x <= 37 - Math.max(0, y - 46)),
    short: (x, y) => mustache(x, y) || (jaw(x, y) && (y > 35 || noise(x, y) < 9)),
    lumberjack: (x, y) => mustache(x, y) || jaw(x, y) || (y > 40 && ((x - 31.5) / 15.5) ** 2 + ((y - 44) / 14) ** 2 <= 1),
  };
  const shape = (x: number, y: number) => !mouth(x, y) && shapes[id](x, y);
  const art = blankAt(SIZE);
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      if (!shape(x, y)) continue;
      const out = (dx: number, dy: number) => !shape(x + dx, y + dy);
      art[y][x] =
        out(0, 1) || out(1, 0) ? "O"
        : (x * 3 + y) % 7 === 0 ? "2"
        : x > 40 ? "2"
        : x < 24 && (x + y) % 5 === 0 ? "4"
        : noise(x, y) === 0 ? "4"
        : "3";
    }
  beard64.set(id, art);
  return art;
}
