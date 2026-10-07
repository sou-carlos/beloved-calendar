/** Birthday recurrence uses local calendar dates, never UTC parsing. Feb 29 is celebrated Feb 28 in non-leap years. */
export function birthdayInYear(birthDate: string, year: number) {
  const [, month, day] = birthDate.split("-").map(Number);
  return new Date(
    year,
    month - 1,
    Math.min(day, new Date(year, month, 0).getDate()),
  );
}
export function daysUntil(birthDate: string, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = birthdayInYear(birthDate, today.getFullYear());
  if (next < today) next = birthdayInYear(birthDate, today.getFullYear() + 1);
  return Math.round(
    (Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86400000,
  );
}
export function birthdayLabel(date: string) {
  return new Date(
    UNKNOWN_YEAR,
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
  ).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}
export function countdown(date: string) {
  const days = daysUntil(date);
  return days === 0 ? "É hoje!" : days === 1 ? "Amanhã" : `Em ${days} dias`;
}
/** Placeholder year for birthdays without a known year. Leap, so Feb 29 stays valid. */
export const UNKNOWN_YEAR = 2000;
export const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString("pt-BR", { month: "long" }),
);
export function daysInMonth(month: number, year?: number) {
  return new Date(year ?? UNKNOWN_YEAR, month, 0).getDate();
}
/** The unknown-year flag only counts with the placeholder year, so a stale flag never hides a real year. */
export function isYearUnknown(person: { birthDate: string; yearUnknown?: boolean }) {
  return !!person.yearUnknown && Number(person.birthDate.slice(0, 4)) === UNKNOWN_YEAR;
}
export function splitBirthDate(person?: { birthDate: string; yearUnknown?: boolean }) {
  if (!person) return { day: "", month: "", year: "" };
  const [year, month, day] = person.birthDate.split("-");
  return {
    day: String(Number(day)),
    month: String(Number(month)),
    year: isYearUnknown(person) ? "" : String(Number(year)),
  };
}
/**
 * Builds the stored date from form fields, or returns an error message in Portuguese.
 * savedYear is the year already stored for this friend: it is accepted even outside the range
 * offered for new dates, so birthdays saved by the old date field stay editable.
 */
export function composeBirthDate(
  day: number,
  month: number,
  year?: number,
  savedYear?: number,
): { birthDate: string; yearUnknown: boolean } | { error: string } {
  if (!month || month < 1 || month > 12) return { error: "Escolha o mês do aniversário." };
  if (!day) return { error: "Escolha o dia do aniversário." };
  const currentYear = new Date().getFullYear();
  const keepsSavedYear = year !== undefined && year === savedYear && year >= 1;
  if (year !== undefined && !keepsSavedYear && (!Number.isInteger(year) || year < 1900 || year > currentYear))
    return { error: `Informe um ano entre 1900 e ${currentYear}, ou deixe em branco.` };
  if (day < 1 || day > daysInMonth(month, year))
    return {
      error:
        year !== undefined && month === 2 && day === 29
          ? `${year} não é bissexto. Fevereiro teve 28 dias.`
          : "Esse dia não existe nesse mês.",
    };
  const pad = (value: number, size: number) => String(value).padStart(size, "0");
  return {
    birthDate: `${pad(year ?? UNKNOWN_YEAR, 4)}-${pad(month, 2)}-${pad(day, 2)}`,
    yearUnknown: year === undefined,
  };
}
