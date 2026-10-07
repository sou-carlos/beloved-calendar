import type { Page } from "@playwright/test";
/** Fills the split birthday fields from an ISO date. Pass year "" to leave it unknown. */
export async function fillBirthday(page: Page, date: string) {
  const [year, month, day] = date.split("-");
  await page.getByLabel("Mês", { exact: true }).selectOption(String(Number(month)));
  await page.getByLabel("Dia", { exact: true }).selectOption(String(Number(day)));
  await page.getByLabel("Ano", { exact: true }).fill(year);
}
