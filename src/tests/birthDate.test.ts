import { describe, it, expect } from "vitest";
import { composeBirthDate, daysInMonth, isYearUnknown, splitBirthDate } from "../lib/dates";
describe("data de aniversário com ano opcional", () => {
  it("usa 2000 e marca o ano como desconhecido sem ano", () => {
    expect(composeBirthDate(7, 3)).toEqual({ birthDate: "2000-03-07", yearUnknown: true });
  });
  it("guarda o ano quando informado", () => {
    expect(composeBirthDate(28, 9, 1998)).toEqual({ birthDate: "1998-09-28", yearUnknown: false });
  });
  it("aceita 29 de fevereiro sem ano e em ano bissexto", () => {
    expect(composeBirthDate(29, 2)).toMatchObject({ birthDate: "2000-02-29" });
    expect(composeBirthDate(29, 2, 1996)).toMatchObject({ birthDate: "1996-02-29" });
  });
  it("recusa 29 de fevereiro em ano comum e dia inexistente", () => {
    expect(composeBirthDate(29, 2, 1997)).toHaveProperty("error");
    expect(composeBirthDate(31, 4)).toHaveProperty("error");
  });
  it("recusa ano fora do intervalo", () => {
    expect(composeBirthDate(1, 1, 1850)).toHaveProperty("error");
    expect(composeBirthDate(1, 1, new Date().getFullYear() + 1)).toHaveProperty("error");
  });
  it("conta os dias do mês considerando o ano", () => {
    expect(daysInMonth(2)).toBe(29);
    expect(daysInMonth(2, 2026)).toBe(28);
    expect(daysInMonth(4)).toBe(30);
  });
  it("aceita o ano já salvo mesmo fora do intervalo de datas novas", () => {
    expect(composeBirthDate(5, 6, 1850, 1850)).toEqual({ birthDate: "1850-06-05", yearUnknown: false });
    expect(composeBirthDate(5, 6, 1, 1)).toEqual({ birthDate: "0001-06-05", yearUnknown: false });
    expect(composeBirthDate(5, 6, 1850, 1990)).toHaveProperty("error");
  });
  it("ignora a marca de ano desconhecido quando o ano não é o 2000", () => {
    const stale = { birthDate: "1995-03-07", yearUnknown: true };
    expect(isYearUnknown(stale)).toBe(false);
    expect(splitBirthDate(stale).year).toBe("1995");
    expect(isYearUnknown({ birthDate: "2000-03-07", yearUnknown: true })).toBe(true);
  });
  it("separa a data salva, escondendo o ano desconhecido", () => {
    expect(splitBirthDate({ birthDate: "2000-03-07", yearUnknown: true })).toEqual({ day: "7", month: "3", year: "" });
    expect(splitBirthDate({ birthDate: "2000-03-07" })).toEqual({ day: "7", month: "3", year: "2000" });
  });
});
