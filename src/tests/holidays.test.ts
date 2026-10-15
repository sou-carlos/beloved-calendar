import { describe, expect, it } from "vitest";
import { brazilianHolidays } from "../lib/holidays";
describe("feriados nacionais", () => {
  it("inclui os dez feriados do calendário federal de 2026", () => {
    const holidays = brazilianHolidays(2026);
    expect(holidays).toHaveLength(10);
    expect(holidays).toContainEqual({
      month: 11,
      day: 20,
      name: "Dia Nacional de Zumbi e da Consciência Negra",
    });
    expect(
      holidays.some((holiday) => /Carnaval|Corpus Christi/.test(holiday.name)),
    ).toBe(false);
  });
  it.each([
    [2024, 3, 29],
    [2025, 4, 18],
    [2026, 4, 3],
    [2027, 3, 26],
    [2038, 4, 23],
  ])("calcula Paixão de Cristo em %i", (year, month, day) => {
    expect(
      brazilianHolidays(year).find(
        (holiday) => holiday.name === "Paixão de Cristo",
      ),
    ).toEqual({ month, day, name: "Paixão de Cristo" });
  });
  it("inclui Consciência Negra como feriado nacional a partir de 2024", () => {
    expect(
      brazilianHolidays(2023).some(
        (holiday) => holiday.month === 11 && holiday.day === 20,
      ),
    ).toBe(false);
  });
});
