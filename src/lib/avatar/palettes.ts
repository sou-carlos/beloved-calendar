/** Color ramps. Each layer paints tone keys, and these ramps turn the keys into colors. */
import { type Ramp } from "./grid";

export interface Swatch {
  id: string;
  label: string;
  ramp: Ramp;
}

// Skin keys: o outline, d deep shadow, s shadow, k base, l light, M lip line, n lip, r cheek.
const skinTone = (id: string, label: string, colors: string[]): Swatch => ({
  id,
  label,
  ramp: Object.fromEntries(["o", "d", "s", "k", "l", "M", "n", "r"].map((key, i) => [key, colors[i]])),
});
export const SKIN_TONES: Swatch[] = [
  skinTone("porcelain", "Porcelana", ["#94503e", "#d08c78", "#ecb49c", "#fcd8c4", "#fff0e2", "#b44a4e", "#e08a84", "#f6b0a0"]),
  skinTone("fair", "Clara", ["#8a3d32", "#c2705a", "#e3a07c", "#f7c9a0", "#ffe0bc", "#a8423e", "#d9786a", "#f0a68a"]),
  skinTone("beige", "Bege", ["#803a2c", "#b86a4c", "#d8946a", "#f0bc8c", "#fcd6a8", "#a03e36", "#cc6e5a", "#e69676"]),
  skinTone("peach", "Pêssego", ["#7a3428", "#ae5e40", "#d08458", "#eaaa78", "#f8c896", "#983832", "#c26450", "#dc8a66"]),
  skinTone("tan", "Morena clara", ["#6a2c20", "#9a5236", "#ba7448", "#d69a64", "#ecba80", "#84302c", "#ae5844", "#c87a56"]),
  skinTone("olive", "Oliva", ["#5a2a1a", "#8a5434", "#a8764a", "#c69a6a", "#deb888", "#7a3a2c", "#a05c44", "#bc7a58"]),
  skinTone("brown", "Morena", ["#4e2014", "#74381e", "#8e4e2a", "#ac6a3c", "#c88a54", "#5e2020", "#8a4230", "#a85a3c"]),
  skinTone("chestnut", "Morena escura", ["#3c160e", "#5e2a18", "#7a3e22", "#955630", "#b07244", "#4e1a18", "#7a3628", "#985034"]),
  skinTone("dark", "Escura", ["#2e110c", "#4a2014", "#62301c", "#7c4426", "#985c36", "#3e1412", "#682e22", "#84442e"]),
  skinTone("deep", "Retinta", ["#1e0a08", "#36160e", "#4a2214", "#60321c", "#7a4628", "#2c0e0c", "#522418", "#6c3422"]),
];

// Hair keys: O outline, 1 dark, 2 shadow, 3 base, 4 light, 5 highlight.
const hairColor = (id: string, label: string, colors: string[]): Swatch => ({
  id,
  label,
  ramp: Object.fromEntries(["O", "1", "2", "3", "4", "5"].map((key, i) => [key, colors[i]])),
});
export const HAIR_COLORS: Swatch[] = [
  hairColor("black", "Preto", ["#0e0b16", "#1b1628", "#29213a", "#3a304f", "#554872", "#7c6c9c"]),
  hairColor("dark-brown", "Castanho-escuro", ["#1f0e12", "#34181a", "#4c2420", "#66352a", "#88503a", "#b0744e"]),
  hairColor("brown", "Castanho", ["#33141c", "#562326", "#7a3a2a", "#a0572f", "#c9823b", "#eab25a"]),
  hairColor("auburn", "Ruivo-escuro", ["#3a0f1a", "#5e1a22", "#852826", "#ac3e2a", "#d0603a", "#ec8c50"]),
  hairColor("ginger", "Ruivo", ["#5a1a1a", "#8e2e20", "#c04a22", "#e2702a", "#f6983c", "#ffc464"]),
  hairColor("strawberry", "Loiro-morango", ["#6e2a34", "#a2483e", "#cc7050", "#e89a66", "#f8be82", "#ffe0a8"]),
  hairColor("blonde", "Loiro", ["#8e3446", "#bd5a3c", "#e08a3a", "#f5b945", "#ffda62", "#fff3a6"]),
  hairColor("platinum", "Platinado", ["#6e5a6a", "#a08e8e", "#c8b8a8", "#e4d8c0", "#f4ecd8", "#fffaf0"]),
  hairColor("gray", "Grisalho", ["#2e2a3a", "#4a4656", "#6a6676", "#8e8a98", "#b4b0bc", "#dcd8e2"]),
  hairColor("white", "Branco", ["#5a5a78", "#8e8ea8", "#b6b6ca", "#d6d6e2", "#eeeef4", "#ffffff"]),
  hairColor("pink", "Rosa", ["#6a1a46", "#9e2e62", "#cc4a80", "#ec70a0", "#ff9cc0", "#ffd0e0"]),
  hairColor("blue", "Azul", ["#121c52", "#1c2e7e", "#2846a8", "#3a66d0", "#5a92ec", "#9cc8ff"]),
  hairColor("green", "Verde", ["#0e3a2e", "#16583a", "#227a44", "#36a050", "#64c464", "#b0e890"]),
  hairColor("purple", "Roxo", ["#2a1048", "#421c6e", "#5e2c94", "#7c42b8", "#a068d8", "#d0a4f4"]),
];

// Eye keys: I dark top of the iris, i iris, j light bottom of the iris.
const eyeColor = (id: string, label: string, [I, i, j]: string[]): Swatch => ({ id, label, ramp: { I, i, j } });
export const EYE_COLORS: Swatch[] = [
  eyeColor("dark-brown", "Castanho-escuro", ["#24120a", "#4a2614", "#74452a"]),
  eyeColor("brown", "Castanho", ["#331a10", "#663a1e", "#9a6236"]),
  eyeColor("hazel", "Mel", ["#3a3012", "#6e6624", "#a8a046"]),
  eyeColor("green", "Verde", ["#12401e", "#2a7a3a", "#5cb860"]),
  eyeColor("blue", "Azul", ["#1d3584", "#2f68cf", "#72aef2"]),
  eyeColor("gray", "Cinza", ["#2e3644", "#5a6676", "#94a2b2"]),
  eyeColor("amber", "Âmbar", ["#5a2a06", "#b06814", "#f0a832"]),
  eyeColor("black", "Preto", ["#0c0a10", "#241e2a", "#4a4052"]),
];

// Shirt keys: O outline, 1 lit edge, 2 shadow, 3 base.
const shirtColor = (id: string, label: string, [O, one, two, three]: string[]): Swatch => ({
  id,
  label,
  ramp: { O, 1: one, 2: two, 3: three },
});
export const SHIRT_COLORS: Swatch[] = [
  shirtColor("teal", "Verde-água", ["#1b3442", "#62b2a2", "#2f6070", "#3e8888"]),
  shirtColor("red", "Vermelha", ["#4a1018", "#ec7050", "#a02a2a", "#cc4436"]),
  shirtColor("mustard", "Mostarda", ["#5a3410", "#f8d860", "#b88a1e", "#e0b42e"]),
  shirtColor("green", "Verde", ["#183a1c", "#78c460", "#34783a", "#4a9c48"]),
  shirtColor("blue", "Azul", ["#141e4a", "#64a0e8", "#2a4ea0", "#3c70c8"]),
  shirtColor("purple", "Roxa", ["#2a1440", "#a46cd0", "#5c2e88", "#7a44ac"]),
  shirtColor("pink", "Rosa", ["#5a1a3a", "#f8a0be", "#b84676", "#e06a98"]),
  shirtColor("brown", "Marrom", ["#2e1a12", "#b2844e", "#6a4428", "#8e6038"]),
  shirtColor("white", "Branca", ["#5a5a6e", "#f8f8fc", "#b8b8c8", "#dcdce6"]),
  shirtColor("black", "Preta", ["#0e0e16", "#565670", "#282838", "#3a3a4e"]),
];
export const FIXED: Ramp = { L: "#2b1414", w: "#fff5ea", h: "#ffffff" };

export const STRAW: Ramp = { O: "#6a3a14", 1: "#f8e08a", 2: "#c8963a", 3: "#e8c060", b: "#b8402e" };
export const GOLD: Ramp = { g: "#f4c440", G: "#9a6a14" };
export const JEWEL: Ramp = { ...GOLD, p: "#f6f2fa", P: "#b8aec8", e: "#d8406e", E: "#7a1a3a" };
export const FELT: Ramp = { O: "#22160f", 1: "#8a6a52", 2: "#4a3426", 3: "#6a4e3a", b: "#2a1a12" };

export const FRAME: Ramp = { F: "#2b1d1d", S: "#1c1c2c", g: "#7a7a9a" };
