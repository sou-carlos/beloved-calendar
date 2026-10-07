import { describe, it, expect } from "vitest";
import { AGES, BEARDS, EARRINGS, EYE_COLORS, GLASSES, HATS, HAIR_COLORS, HAIR_STYLES, SHIRT_COLORS, SIZE, SKIN_TONES, avatarPixels, describeAvatar } from "../lib/avatar";
const lists = [HAIR_STYLES, HAIR_COLORS, SKIN_TONES, EYE_COLORS, SHIRT_COLORS, AGES, HATS, EARRINGS, GLASSES, BEARDS];
describe("montagem do rosto", () => {
  it("tem catálogo com ids únicos e no formato aceito pelo servidor", () => {
    for (const list of lists) {
      const ids = list.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{1,32}$/);
    }
  });
  it("cobre a variedade combinada", () => {
    expect(lists.map((list) => list.length)).toEqual([24, 14, 10, 8, 10, 3, 8, 7, 4, 5]);
  });
  it("desenha todos os cabelos dentro da grade de 64", () => {
    for (const style of HAIR_STYLES)
      for (const layer of [style.front, style.back].filter((l) => l !== undefined)) {
        expect(layer.tones).toHaveLength(SIZE);
        for (const row of layer.tones) expect(row).toHaveLength(SIZE);
        expect(layer.tones.flat().some((key) => key !== ".")).toBe(true);
      }
  });
  it("pinta pele, olhos, cabelo e camiseta com as cores escolhidas", () => {
    const pixels = avatarPixels({ hair: "short", hairColor: "blue", skin: "tan", eyes: "green", shirt: "red" }).flat();
    expect(pixels).toContain(SKIN_TONES.find((s) => s.id === "tan")!.ramp.k);
    expect(pixels).toContain(EYE_COLORS.find((e) => e.id === "green")!.ramp.i);
    expect(pixels).toContain(HAIR_COLORS.find((h) => h.id === "blue")!.ramp["3"]);
    expect(pixels).toContain(SHIRT_COLORS.find((s) => s.id === "red")!.ramp["3"]);
  });
  it("muda só os detalhes do rosto com a idade", () => {
    const base = { hair: "bald", hairColor: "gray", skin: "fair", eyes: "blue" };
    const adult = avatarPixels({ ...base, age: "adult" });
    const old = avatarPixels({ ...base, age: "old" });
    const teen = avatarPixels({ ...base, age: "teen" });
    expect(old).not.toEqual(adult);
    expect(teen).not.toEqual(adult);
    expect(avatarPixels(base)).toEqual(adult);
  });
  it("desenha cada acessório e esconde o cabelo sob o chapéu", () => {
    const base = { hair: "afro", hairColor: "pink", skin: "fair", eyes: "blue" };
    const bare = avatarPixels(base);
    for (const [key, list] of [["hat", HATS], ["earrings", EARRINGS], ["glasses", GLASSES], ["beard", BEARDS]] as const)
      for (const option of list.slice(1)) expect(avatarPixels({ ...base, [key]: option.id })).not.toEqual(bare);
    const pink = HAIR_COLORS.find((h) => h.id === "pink")!.ramp;
    const topRows = (grid: string[][]) => grid.slice(0, 14).flat().filter((c) => Object.values(pink).includes(c)).length;
    expect(topRows(avatarPixels({ ...base, hat: "straw" }))).toBeLessThan(topRows(bare));
  });
  it("descreve opções desconhecidas sem confundir com a primeira opção", () => {
    const known = { hair: "bald", hairColor: "brown", skin: "fair", eyes: "blue" };
    expect(describeAvatar({ ...known, hair: "future-style" })).toContain("Indisponível (future-style)");
    expect(describeAvatar({ ...known, hat: "crown-2030" })).toContain("chapéu indisponível (crown-2030)");
    expect(describeAvatar({ ...known, hat: "straw", beard: "short" })).toContain("barba curta, chapéu de palha");
  });
  it("guarda em cache o rosto já desenhado", () => {
    const face = { hair: "short", hairColor: "brown", skin: "fair", eyes: "blue" };
    expect(avatarPixels({ ...face })).toBe(avatarPixels({ ...face }));
  });
  it("aceita rostos salvos antes da camiseta e ids desconhecidos", () => {
    expect(describeAvatar({ hair: "bob", hairColor: "auburn", skin: "tan", eyes: "green" })).toContain("camiseta verde-água");
    const pixels = avatarPixels({ hair: "nope", hairColor: "nope", skin: "nope", eyes: "nope" }).flat();
    expect(pixels).toContain(SKIN_TONES[0].ramp.k);
  });
});
