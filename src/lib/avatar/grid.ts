/** Grid primitives shared by every layer. Art is authored on a 32 grid and rendered on a 64 grid. */

/** Most art is authored on a 32x32 grid and doubled; coils and locs are drawn natively at 64. */
export const ART = 32;
export const SIZE = ART * 2;

export type Ramp = Record<string, string>;
export type Grid = string[][];
export type Span = [number, number];

export const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
export const blank = (): Grid => Array.from({ length: ART }, () => Array<string>(ART).fill("."));
/** A span and its mirror image across the vertical center of the face. */
export const sym = (from: number, to: number): Span[] => [[from, to], [ART - 1 - to, ART - 1 - from]];
export const wave = (y: number) => [0, 1, 1, 0, -1, -1][((y % 6) + 6) % 6];

export function mask(rows: Record<number, Span[]>): Grid {
  const grid = blank();
  for (const [y, spans] of Object.entries(rows))
    for (const [from, to] of spans)
      for (const x of range(Math.max(0, from), Math.min(ART - 1, to))) grid[Number(y)][x] = "#";
  return grid;
}
export function ascii(lines: string[]): Grid {
  const grid = blank();
  lines.forEach((line, y) => Array.from(line).forEach((key, x) => (grid[y][x] = key)));
  return grid;
}

export const rowsOf = (from: number, to: number, spans: (y: number) => Span[]) =>
  Object.fromEntries(range(from, to).map((y) => [y, spans(y)]));

/** Deterministic pixel noise, so the same face always renders the same coils. */
export const noise = (x: number, y: number) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 11;

export type KeyedSpan = [number, number, string];
export function paintRows(rows: Record<number, KeyedSpan[]>) {
  const grid = blank();
  for (const [y, spans] of Object.entries(rows))
    for (const [from, to, key] of spans) for (const x of range(from, to)) grid[Number(y)][x] = key;
  return grid;
}

/** Plots pixels from a list of [x, y, key] on the 64 grid. */
export function plot(points: [number, number, string][]): Grid {
  const grid = blankAt(SIZE);
  for (const [x, y, key] of points) if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) grid[y][x] = key;
  return grid;
}

export function inside(grid: Grid, x: number, y: number): boolean {
  const size = grid.length;
  return y >= size || (x >= 0 && y >= 0 && x < size && grid[y][x] !== ".");
}

export function blankAt(size: number): Grid {
  return Array.from({ length: size }, () => Array<string>(size).fill("."));
}
/**
 * Doubles 32-grid art to the 64 grid. Outline keys are then thinned back to a single pixel
 * where they face away from the outside, so contours read as fine 1px lines at 64.
 */
export function hiRes(grid: Grid, outlineKeys = ""): Grid {
  const up = grid.flatMap((row) => {
    const wide = row.flatMap((key) => [key, key]);
    return [wide, [...wide]];
  });
  if (!outlineKeys) return up;
  const size = up.length;
  return up.map((row, y) => row.map((key, x) => {
    if (!outlineKeys.includes(key)) return key;
    const around = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as const;
    if (around.some(([nx, ny]) => ny < size && (nx < 0 || ny < 0 || nx >= size || up[ny][nx] === "."))) return key;
    const fill = around.map(([nx, ny]) => up[ny]?.[nx]).find((k) => k && k !== "." && !outlineKeys.includes(k));
    return fill ?? key;
  }));
}


/** Indices 0..count-1, for building lists of strands or flowers. */
export const indices = (count: number) => Array.from({ length: count }, (_, i) => i);

/**
 * Shades a flat mask by its contour: outline on edges facing right or down, a softer key on edges
 * facing the top-left light, shadow one pixel in from the outline, base elsewhere.
 */
export function contour(shape: Grid, litEdge: string): Grid {
  return shape.map((row, y) => row.map((pixel, x) => {
    if (pixel === ".") return ".";
    if (!inside(shape, x + 1, y) || !inside(shape, x, y + 1)) return "O";
    if (!inside(shape, x - 1, y) || !inside(shape, x, y - 1)) return litEdge;
    if (!inside(shape, x + 2, y) || !inside(shape, x, y + 2)) return "2";
    return "3";
  }));
}
