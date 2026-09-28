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
    2000,
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
  ).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}
export function countdown(date: string) {
  const days = daysUntil(date);
  return days === 0 ? "É hoje!" : days === 1 ? "Amanhã" : `Em ${days} dias`;
}
