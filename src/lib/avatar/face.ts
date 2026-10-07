/** Head, face, age details and shirt. Authored on the 32 grid and doubled once for the 64 render. */
import { blank, contour, hiRes, mask, paintRows, range, rowsOf, type Grid, type KeyedSpan } from "./grid";

// Head, neck and the skin inside the V neckline. Shadow down the right side, ears shaded.
export const HEAD = (() => {
  const rows: Record<number, KeyedSpan[]> = {
    4: [[11, 20, "o"]],
    5: [[9, 10, "o"], [11, 20, "k"], [21, 22, "o"]],
    6: [[8, 8, "o"], [9, 22, "k"], [23, 23, "o"]],
  };
  for (const y of range(7, 17)) rows[y] = [[7, 7, "o"], [8, 21, "k"], [22, 22, "s"], [23, 23, "d"], [24, 24, "o"]];
  for (const y of range(8, 11)) rows[y].push([8, 8, "l"]);
  for (const y of [18, 19]) rows[y] = [[8, 8, "o"], [9, 20, "k"], [21, 21, "s"], [22, 22, "d"], [23, 23, "o"]];
  rows[20] = [[9, 9, "o"], [10, 19, "k"], [20, 20, "s"], [21, 21, "d"], [22, 22, "o"]];
  rows[21] = [[10, 10, "o"], [11, 18, "k"], [19, 19, "s"], [20, 20, "d"], [21, 21, "o"]];
  rows[22] = [[11, 12, "o"], [13, 17, "k"], [18, 18, "s"], [19, 20, "o"]];
  rows[23] = [[12, 19, "o"]];
  rows[24] = [[12, 12, "o"], [13, 18, "d"], [19, 19, "o"]];
  rows[25] = [[12, 12, "o"], [13, 17, "s"], [18, 18, "d"], [19, 19, "o"]];
  rows[26] = [[13, 17, "s"], [18, 18, "d"]];
  rows[27] = [[14, 16, "s"], [17, 17, "d"]];
  rows[28] = [[15, 16, "d"]];
  rows[12].push([6, 6, "o"], [25, 25, "o"]);
  rows[13].push([5, 5, "o"], [6, 7, "s"], [24, 25, "d"], [26, 26, "o"]);
  for (const y of [14, 15]) rows[y].push([5, 5, "o"], [6, 6, "k"], [7, 7, "s"], [24, 24, "d"], [25, 25, "s"], [26, 26, "o"]);
  rows[16].push([5, 5, "o"], [6, 7, "s"], [24, 25, "d"], [26, 26, "o"]);
  rows[17].push([6, 6, "o"], [25, 25, "o"]);
  return paintRows(rows);
})();

// B brow, L lash line, w white, h catchlight, I/i/j iris, N nose shadow, D nostril, M/n smile, r cheek.
// Neutral expression: straight brows, an even lid line, no blush and a skin-toned mouth.
export const FACE = paintRows({
  11: [[10, 13, "B"], [18, 21, "B"]],
  13: [[10, 13, "L"], [18, 21, "L"]],
  14: [[10, 10, "w"], [11, 11, "h"], [12, 13, "I"], [18, 18, "h"], [19, 20, "I"], [21, 21, "w"]],
  15: [[10, 10, "w"], [11, 12, "i"], [13, 13, "j"], [18, 19, "i"], [20, 20, "j"], [21, 21, "w"]],
  16: [[12, 12, "N"], [16, 16, "N"], [19, 19, "N"]],
  17: [[16, 16, "N"]],
  18: [[15, 16, "D"]],
  20: [[14, 14, "n"], [15, 16, "M"], [17, 17, "n"]],
  21: [[15, 16, "n"]],
});

// Age changes face details only, so every hairstyle keeps fitting the same head.
// Keys: k skin base (erases a detail), N skin shadow, D deep shadow, r cheek.
export const AGES = [
  { id: "teen", label: "Adolescente" },
  { id: "adult", label: "Adulto" },
  { id: "old", label: "Idoso" },
];
export const AGE_DETAILS: Record<string, Grid> = {
  // Thinner brows, no under-eye shadow, softer nose and rosier cheeks.
  teen: paintRows({
    11: [[10, 10, "k"], [21, 21, "k"]],
    16: [[11, 12, "k"], [16, 16, "k"], [19, 20, "k"], [9, 10, "r"], [21, 22, "r"]],
    17: [[9, 11, "r"], [20, 22, "r"]],
  }),
  adult: blank(),
  // Forehead lines, crow's feet, under-eye bags and nose-to-mouth folds in the deep shadow tone.
  old: paintRows({
    9: [[11, 14, "D"], [17, 20, "D"]],
    14: [[8, 8, "D"], [23, 23, "D"]],
    15: [[8, 8, "D"]],
    16: [[10, 13, "N"], [18, 21, "N"]],
    18: [[12, 12, "D"], [19, 19, "D"]],
    19: [[12, 12, "D"], [19, 19, "D"]],
  }),
};

export const SHIRT_MASK = mask({
  25: [[9, 11], [20, 22]],
  26: [[6, 12], [19, 25]],
  27: [[4, 13], [18, 27]],
  28: [[3, 14], [17, 28]],
  ...rowsOf(29, 31, () => [[2, 29]]),
});

export const SHIRT_SHADED = contour(SHIRT_MASK, "1");


// 32-grid art doubled once for the 64 render. Contours are thinned to 1px, inner details stay doubled.
export const HEAD_64 = hiRes(HEAD, "o");
export const FACE_64 = hiRes(FACE);
export const SHIRT_64 = hiRes(SHIRT_SHADED, "O");
export const AGE_64 = Object.fromEntries(Object.entries(AGE_DETAILS).map(([id, grid]) => [id, hiRes(grid)]));
