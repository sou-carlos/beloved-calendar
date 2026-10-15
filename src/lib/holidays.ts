export interface Holiday {
  month: number;
  day: number;
  name: string;
}

/** National holidays in the federal calendar; municipal holidays and optional days are excluded.
 * Reference: Portaria MGI nº 11.460/2025. Dates use the local calendar, including Good Friday.
 */
export function brazilianHolidays(year: number): Holiday[] {
  // Gregorian computus (Meeus/Jones/Butcher) for Easter Sunday.
  const a = year % 19,
    b = Math.floor(year / 100),
    c = year % 100;
  const d = Math.floor(b / 4),
    e = b % 4;
  const f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4),
    k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
  const goodFriday = new Date(year, easterMonth - 1, easterDay - 2);
  return [
    { month: 1, day: 1, name: "Confraternização Universal" },
    {
      month: goodFriday.getMonth() + 1,
      day: goodFriday.getDate(),
      name: "Paixão de Cristo",
    },
    { month: 4, day: 21, name: "Tiradentes" },
    { month: 5, day: 1, name: "Dia do Trabalho" },
    { month: 9, day: 7, name: "Independência do Brasil" },
    { month: 10, day: 12, name: "Nossa Senhora Aparecida" },
    { month: 11, day: 2, name: "Finados" },
    { month: 11, day: 15, name: "Proclamação da República" },
    ...(year >= 2024
      ? [
          {
            month: 11,
            day: 20,
            name: "Dia Nacional de Zumbi e da Consciência Negra",
          },
        ]
      : []),
    { month: 12, day: 25, name: "Natal" },
  ].sort((a, b) => a.month - b.month || a.day - b.day);
}
