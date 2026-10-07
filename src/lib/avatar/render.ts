/**
 * Composes the 64x64 bust, back to front: hair behind the head, head, face, age details, shirt,
 * earrings, beard, hair in front, glasses, hat. Original art in the style of farm-life RPG portraits.
 */
import type { Avatar } from "../../models";
import { SIZE, type Grid, type Ramp } from "./grid";
import { EYE_COLORS, FIXED, FRAME, HAIR_COLORS, JEWEL, SHIRT_COLORS, SKIN_TONES, STRAW, GOLD, type Swatch } from "./palettes";
import { HAIR_STYLES, dimTones } from "./hair";
import { AGES, AGE_64, FACE_64, HEAD_64, SHIRT_64 } from "./face";
import { BEARDS, EARRINGS, GLASSES, HATS, accessoryArt, beardArt, byAccessory } from "./accessories";

/** Chance that a random face has no accessory of a given kind, so extras stay a nice surprise. */
const NO_ACCESSORY_CHANCE = 0.7;
const NO_BEARD_CHANCE = 0.75;
/** Under a hat, back hair outside these columns is tucked in so big volumes don't stick out as wings. */
const HAT_TUCK = { left: 8, right: 55 };
/** Rendered faces kept in memory. A calendar shows the same few faces many times. */
const CACHE_LIMIT = 300;

// Unknown ids, for example from a newer version of the app, fall back to the first option for drawing.
const byId = (list: Swatch[], id: string | undefined) => list.find((item) => item.id === id) || list[0];
function avatarParts(avatar: Avatar) {
  return {
    style: HAIR_STYLES.find((style) => style.id === avatar.hair) || HAIR_STYLES[0],
    hair: byId(HAIR_COLORS, avatar.hairColor),
    skin: byId(SKIN_TONES, avatar.skin),
    eyes: byId(EYE_COLORS, avatar.eyes),
    shirt: byId(SHIRT_COLORS, avatar.shirt),
    age: AGES.find((age) => age.id === avatar.age) || AGES[1],
    hat: byAccessory(HATS, avatar.hat),
    earrings: byAccessory(EARRINGS, avatar.earrings),
    glasses: byAccessory(GLASSES, avatar.glasses),
    beard: byAccessory(BEARDS, avatar.beard),
  };
}

const cache = new Map<string, string[][]>();
const cacheKey = (avatar: Avatar) =>
  [avatar.hair, avatar.hairColor, avatar.skin, avatar.eyes, avatar.shirt, avatar.age, avatar.hat, avatar.earrings, avatar.glasses, avatar.beard].join("|");

/** Returns a 64x64 grid of CSS colors, empty string for transparent pixels. Results are cached. */
export function avatarPixels(avatar: Avatar): string[][] {
  const key = cacheKey(avatar);
  const cached = cache.get(key);
  if (cached) return cached;
  const grid = composeAvatar(avatar);
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, grid);
  return grid;
}

function composeAvatar(avatar: Avatar): string[][] {
  const { style, hair, skin, eyes, shirt, age, hat, earrings, glasses, beard } = avatarParts(avatar);
  const grid = Array.from({ length: SIZE }, () => Array<string>(SIZE).fill(""));
  const paint = (layer: Grid, tones: Ramp) =>
    layer.forEach((row, y) => row.forEach((key, x) => tones[key] && (grid[y][x] = tones[key])));
  const s = skin.ramp;
  const isSkin = (x: number, y: number) => "kl".includes(HEAD_64[y]?.[x] ?? ".") && FACE_64[y][x] === ".";
  if (style.back) paint(dimTones(style.back, !style.back.keepBright), { ...hair.ramp, ...GOLD });
  paint(HEAD_64, s);
  paint(FACE_64, { ...FIXED, ...eyes.ramp, B: hair.ramp[1], N: s.s, D: s.d, M: s.o, n: s.s });
  paint(AGE_64[age.id], { k: s.k, N: s.s, D: s.d, r: s.r });
  paint(SHIRT_64, shirt.ramp);
  const earringArt = accessoryArt(earrings);
  if (earringArt) paint(earringArt, JEWEL);
  const beardGrid = beardArt(beard.id);
  if (beardGrid) paint(beardGrid, hair.ramp);
  if (style.front) {
    paint(dimTones(style.front), { ...hair.ramp, ...GOLD });
    // Hair casts a soft two-pixel shadow on the skin right below it.
    const front = style.front.tones;
    for (let y = 0; y < SIZE - 2; y++)
      for (let x = 0; x < SIZE; x++)
        if (front[y][x] !== "." && front[y + 1][x] === ".")
          for (const dy of [1, 2]) if (front[y + dy][x] === "." && isSkin(x, y + dy)) grid[y + dy][x] = s.s;
  }
  const glassesArt = accessoryArt(glasses);
  if (glassesArt) paint(glassesArt, FRAME);
  const hatArt = accessoryArt(hat, "O");
  if (hatArt && !hat.clip) paint(hatArt, hat.ramp ?? { ...shirt.ramp, b: shirt.ramp[2] });
  if (hatArt && hat.clip) {
    // Hide the hair the hat covers. Under a hat, hair close to the head stays and wide volumes
    // behind it are tucked in, so a big afro reads as hair pressed under the hat instead of wings.
    const below = hat.clip * 2 + 1;
    const front = style.front?.tones;
    const back = style.back?.tones;
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if (hatArt[y][x] !== ".") continue;
        const inFront = !!front && front[y][x] !== ".";
        const inBack = !!back && back[y][x] !== ".";
        const underHat = y <= below && (inFront || inBack);
        const tuckedBack = (x < HAT_TUCK.left || x > HAT_TUCK.right) && inBack && !inFront;
        if (underHat || tuckedBack) grid[y][x] = "";
      }
    paint(hatArt, hat.id === "straw" ? STRAW : hat.ramp ?? { ...shirt.ramp, b: shirt.ramp[2] });
    const brim = hatArt.findLastIndex((row) => row.some((key) => key !== "."));
    for (let x = 0; x < SIZE; x++)
      if (hatArt[brim][x] !== ".")
        for (const dy of [1, 2]) if (brim + dy < SIZE && isSkin(x, brim + dy)) grid[brim + dy][x] = s.s;
  }
  return grid;
}

/** Horizontal runs of equal color, so the SVG needs one rect per run instead of per pixel. */
export function avatarRects(avatar: Avatar) {
  const rects: { x: number; y: number; width: number; color: string }[] = [];
  avatarPixels(avatar).forEach((row, y) => {
    for (let x = 0; x < SIZE; ) {
      const color = row[x];
      let end = x + 1;
      while (end < SIZE && row[end] === color) end++;
      if (color) rects.push({ x, y, width: end - x, color });
      x = end;
    }
  });
  return rects;
}

export function randomAvatar(): Avatar {
  const pick = (list: { id: string }[]) => list[Math.floor(Math.random() * list.length)].id;
  return {
    hair: pick(HAIR_STYLES),
    hairColor: pick(HAIR_COLORS),
    skin: pick(SKIN_TONES),
    eyes: pick(EYE_COLORS),
    shirt: pick(SHIRT_COLORS),
    age: pick(AGES),
    hat: Math.random() < NO_ACCESSORY_CHANCE ? "none" : pick(HATS.slice(1)),
    earrings: Math.random() < NO_ACCESSORY_CHANCE ? "none" : pick(EARRINGS.slice(1)),
    glasses: Math.random() < NO_ACCESSORY_CHANCE ? "none" : pick(GLASSES.slice(1)),
    beard: Math.random() < NO_BEARD_CHANCE ? "none" : pick(BEARDS.slice(1)),
  };
}

/**
 * Describes a face in Portuguese. A saved id this version doesn't know is named as unavailable
 * together with the id, so two different saved faces never read the same, e.g. in a sync conflict.
 */
export function describeAvatar(avatar: Avatar) {
  const parts = avatarParts(avatar);
  const name = (list: { id: string }[], id: string | undefined, option: { id: string; label: string }) =>
    id !== undefined && !list.some((item) => item.id === id) ? `indisponível (${id})` : option.label.toLowerCase();
  const style = name(HAIR_STYLES, avatar.hair, parts.style);
  // Accessory labels already say what they are ("Barba curta", "Chapéu de palha"), so the kind
  // is only spelled out for an unknown id.
  const extra = (kind: string, list: { id: string }[], id: string | undefined, option: { id: string; label: string }) =>
    id !== undefined && id !== "none" && (list.some((item) => item.id === id) ? option.label.toLowerCase() : `${kind} ${name(list, id, option)}`);
  const extras = [
    extra("barba", BEARDS, avatar.beard, parts.beard),
    extra("chapéu", HATS, avatar.hat, parts.hat),
    avatar.earrings !== undefined && avatar.earrings !== "none" && `brinco ${name(EARRINGS, avatar.earrings, parts.earrings)}`,
    avatar.glasses !== undefined && avatar.glasses !== "none" && `óculos ${name(GLASSES, avatar.glasses, parts.glasses)}`,
  ].filter(Boolean);
  return [
    `${style.charAt(0).toUpperCase()}${style.slice(1)}, cabelo ${name(HAIR_COLORS, avatar.hairColor, parts.hair)}, pele ${name(SKIN_TONES, avatar.skin, parts.skin)}, olhos ${name(EYE_COLORS, avatar.eyes, parts.eyes)}, camiseta ${name(SHIRT_COLORS, avatar.shirt, parts.shirt)}, ${name(AGES, avatar.age, parts.age)}`,
    ...extras,
  ].join(", ");
}
