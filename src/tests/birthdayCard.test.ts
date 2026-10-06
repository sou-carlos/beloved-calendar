import { describe, expect, it } from "vitest";
import { birthdayCardFilename, cardLines } from "../lib/birthdayCard";

const measure = { measureText: (text: string) => ({ width: Array.from(text).length * 10 }) as TextMetrics };
describe("texto da carta", () => {
  it("preserva parágrafos e quebra palavras extensas sem exceder a largura", () => {
    const lines = cardLines(measure, "Feliz aniversário!\n\nCom carinho", 80);
    expect(lines).toContain("");
    expect(lines.every((line) => measure.measureText(line).width <= 80)).toBe(true);
    expect(lines.join("").replaceAll(" ", "")).toBe("Felizaniversário!Comcarinho");
  });
  it("não divide caracteres Unicode ao quebrar palavras", () => {
    expect(cardLines(measure, "🌻🌻🌻🌻🌻", 20)).toEqual(["🌻🌻", "🌻🌻", "🌻"]);
  });
  it("usa nome de arquivo válido para nomes com acentos ou símbolos", () => {
    expect(birthdayCardFilename("Marina Açucena")).toBe("parabens-marina-acucena.png");
    expect(birthdayCardFilename("♡")).toBe("parabens-aniversario.png");
  });
});
