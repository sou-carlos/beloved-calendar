import { test, expect } from "@playwright/test";
import { fillBirthday } from "./birthday";

test("sincroniza no login, nas alterações e pelo botão, sem polling ou reconexão", async ({ page }) => {
  const account = { id: "11111111-1111-4111-8111-111111111111", name: "Marina", email: "marina@example.com", createdAt: "2026-01-01" };
  let loggedIn = false;
  let snapshots = 0;
  let writes = 0;
  const records = new Map<string, { id: string; version: number; person: unknown }>();
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/api/auth/me") return route.fulfill({ status: loggedIn ? 200 : 401, json: loggedIn ? account : { message: "Entre na sua conta" } });
    if (url.pathname === "/api/auth/csrf") return route.fulfill({ json: { token: "test", headerName: "X-CSRF-TOKEN" } });
    if (url.pathname === "/api/auth/login") {
      loggedIn = true;
      return route.fulfill({ json: account });
    }
    if (url.pathname === "/api/sync" && request.method() === "GET") {
      snapshots++;
      return route.fulfill({ json: { accountId: account.id, records: [...records.values()] } });
    }
    if (url.pathname === "/api/sync" && request.method() === "POST") {
      writes++;
      const body = request.postDataJSON();
      const record = { id: body.id, version: (records.get(body.id)?.version || 0) + 1, person: body.person };
      records.set(body.id, record);
      return route.fulfill({ json: { accountId: account.id, operationId: body.operationId, status: "accepted", record } });
    }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(account.email);
  await page.getByLabel("Senha", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
  expect(snapshots).toBe(1);
  await page.clock.install();
  await page.clock.fastForward(60000);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("offline"));
    window.dispatchEvent(new Event("online"));
  });
  await page.getByRole("heading", { name: "Olá, Marina!" }).waitFor();
  expect(snapshots).toBe(1);
  expect(writes).toBe(0);
  await page.getByRole("button", { name: "Sincronizar agora" }).click();
  await expect.poll(() => snapshots).toBe(2);
  await page.getByRole("link", { name: "Amigos", exact: true }).first().click();
  await page.locator(".add-friend").click();
  await page.getByLabel("Nome", { exact: true }).fill("Amigo novo");
  await fillBirthday(page, "2000-10-10");
  await page.getByRole("button", { name: "Salvar amigo" }).click();
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
  expect(writes).toBe(1);
  expect(snapshots).toBe(3);
  await page.clock.fastForward(60000);
  expect(snapshots).toBe(3);
});
