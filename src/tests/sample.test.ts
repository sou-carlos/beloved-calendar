import { describe, it, expect } from "vitest";
import { birthdayInYear, daysUntil, birthdayLabel } from "../lib/dates";
describe("aniversários recorrentes", () => {
  it("reconhece o dia atual mesmo ao final do dia", () => {
    expect(daysUntil("1998-09-28", new Date(2026, 8, 28, 23, 59))).toBe(0);
  });
  it("passa para o próximo ano depois do aniversário", () => {
    expect(daysUntil("1998-01-01", new Date(2026, 11, 31))).toBe(1);
  });
  it("não considera o ano de nascimento na contagem", () => {
    expect(daysUntil("2000-10-01", new Date(2026, 8, 28))).toBe(3);
  });
  it("celebra 29 de fevereiro em 28 de fevereiro em anos comuns", () => {
    const day = birthdayInYear("2000-02-29", 2026);
    expect(day.getMonth()).toBe(1);
    expect(day.getDate()).toBe(28);
    expect(daysUntil("2000-02-29", new Date(2026, 1, 28))).toBe(0);
  });
  it("preserva 29 de fevereiro nos anos bissextos", () => {
    expect(birthdayInYear("2000-02-29", 2028).getDate()).toBe(29);
  });
  it("conta corretamente entre anos bissextos", () => {
    expect(daysUntil("2000-03-01", new Date(2028, 1, 28))).toBe(2);
  });
  it("exibe dia e mês em português", () => {
    expect(birthdayLabel("2000-02-29")).toBe("29 de fevereiro");
  });
});
