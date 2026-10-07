import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { fillBirthday } from "./birthday";

test("resposta perdida e edição durante envio preservam fila após recarregar", async ({ page, context }, info) => {
  const email = `sync-retry-${info.project.name}-${crypto.randomUUID()}@example.com`;
  const account = await authenticate(context, email, true);
  const operations: string[] = [];
  let firstSent = false;
  let release!: () => void;
  const responseGate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/sync", async route => {
    if (route.request().method() !== "POST") return route.continue();
    operations.push(route.request().postDataJSON().operationId);
    if (firstSent) return route.continue();
    firstSent = true;
    await route.fetch(); // The server commits, but the client never receives the acknowledgment.
    await responseGate;
    await route.abort();
  });
  await addFriend(page, "Primeira versão", true);
  await expect.poll(() => firstSent).toBe(true);
  await editName(page, "Primeira versão", "Edição durante envio");
  release();
  await expect(page.getByText(/Não foi possível sincronizar/)).toBeVisible();
  await page.reload();
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Edição durante envio", exact: true })).toBeVisible();
  expect(operations.length).toBeGreaterThanOrEqual(3);
  expect(operations[0]).toBe(operations[1]);
  const snapshot = await (await context.request.get(`http://127.0.0.1:4173/api/sync?accountId=${account.id}`)).json();
  expect(snapshot.records).toHaveLength(1);
  expect(snapshot.records[0].version).toBe(2);
  expect(snapshot.records[0].person.name).toBe("Edição durante envio");
});

test("sessão expirada preserva alterações na conta original", async ({ page, context }, info) => {
  const email = `sync-expired-${info.project.name}-${crypto.randomUUID()}@example.com`;
  await authenticate(context, email, true);
  await addFriend(page, "Amigo da conta", true);
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await editName(page, "Amigo da conta", "Alteração pendente");
  await context.clearCookies();
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByRole("region", { name: "Sincronização da conta" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Alteração pendente", exact: true })).toHaveCount(0);
  await authenticate(context, email);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Alteração pendente", exact: true })).toBeVisible();
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
});

async function authenticate(context: BrowserContext, email: string, register = false) {
  const csrf = await (await context.request.get("http://127.0.0.1:4173/api/auth/csrf")).json();
  const response = await context.request.post(`http://127.0.0.1:4173/api/auth/${register ? "register" : "login"}`, {
    headers: { [csrf.headerName]: csrf.token },
    data: { name: "Conta sincronizada", email, password: "sync-password-123" },
  });
  expect(response.ok()).toBe(true);
  return response.json();
}
async function addFriend(page: Page, name: string, signedIn = false) {
  await page.goto("/people");
  if (signedIn) await expect(page.getByRole("region", { name: "Sincronização da conta" })).toBeVisible();
  await page.locator(".add-friend").click();
  await page.getByLabel("Nome", { exact: true }).fill(name);
  await fillBirthday(page, "2000-10-10");
  await page.getByRole("button", { name: "Salvar amigo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
async function syncNow(page: Page) {
  const button = page.getByRole("button", { name: "Sincronizar agora" });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(button).toBeEnabled();
}
async function editName(page: Page, current: string, next: string) {
  await page.getByRole("button", { name: new RegExp(current) }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Nome", { exact: true }).fill(next);
  await page.getByRole("button", { name: "Salvar amigo" }).click();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
}

test("importação opcional, offline após recarregar e isolamento entre contas", async ({ page, context }, info) => {
  const email = `sync-import-${info.project.name}-${crypto.randomUUID()}@example.com`;
  await addFriend(page, "Amigo visitante");
  await authenticate(context, email, true);
  await page.goto("/people");
  await expect(page.getByRole("heading", { name: "Nenhum amigo cadastrado" })).toBeVisible();
  await page.getByRole("button", { name: "Adicionar à minha conta" }).click();
  await expect(page.getByRole("heading", { name: "Amigo visitante", exact: true })).toBeVisible();
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Amigo visitante", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Adicionar à minha conta" })).toHaveCount(0);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Amigo visitante", exact: true })).toBeVisible();
  await editName(page, "Amigo visitante", "Amigo editado offline");
  await expect(page.getByText(/Offline · 1 alteração/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Amigo editado offline", exact: true })).toBeVisible();
  await context.setOffline(false);
  await syncNow(page);
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Sair da conta" }).click();
  await expect(page.getByRole("heading", { name: "Olá, visitante!" })).toBeVisible();
  await page.goto("/people");
  await expect(page.getByRole("heading", { name: "Amigo visitante", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Amigo editado offline", exact: true })).toHaveCount(0);
  await authenticate(context, `other-${email}`, true);
  await page.goto("/people");
  await expect(page.getByRole("heading", { name: "Nenhum amigo cadastrado" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Amigo editado offline", exact: true })).toHaveCount(0);
});

test("dois dispositivos preservam conflitos e propagam exclusões e presentes", async ({ page, context, browser }, info) => {
  const email = `sync-devices-${info.project.name}-${crypto.randomUUID()}@example.com`;
  await authenticate(context, email, true);
  await addFriend(page, "Marina original", true);
  await page.getByRole("button", { name: /Marina original/ }).click();
  await page.getByLabel("Nova ideia").fill("Livro sincronizado");
  await page.getByRole("button", { name: "Adicionar ideia" }).click();
  await page.getByRole("checkbox", { name: /Livro sincronizado/ }).check();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
  const second = await browser.newContext({ baseURL: "http://127.0.0.1:4173" });
  try {
    await authenticate(second, email);
    const other = await second.newPage();
    await other.goto("/people");
    await expect(other.getByRole("heading", { name: "Marina original", exact: true })).toBeVisible();
    await other.getByRole("button", { name: /Marina original/ }).click();
    await expect(other.getByRole("checkbox", { name: /Livro sincronizado/ })).toBeChecked();
    await other.getByRole("button", { name: "Fechar", exact: true }).click();
    await context.setOffline(true);
    await editName(page, "Marina original", "Marina local");
    await editName(other, "Marina original", "Marina remota");
    await expect(other.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
    await context.setOffline(false);
    await syncNow(page);
    await expect(page.getByText("Revisar conflito: Marina local", { exact: true })).toBeVisible();
    await page.getByText("Revisar conflito: Marina local", { exact: true }).click();
    await expect(page.getByText("Marina remota", { exact: true })).toBeVisible();
    await page.screenshot({ path: `test-results/sync-conflict-${info.project.name}.png`, fullPage: true, scale: "css" });
    await page.getByRole("button", { name: "Manter conta e criar cópia local" }).click();
    await expect(page.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Marina local (cópia local)", exact: true })).toBeVisible();
    await syncNow(other);
    await expect(other.getByRole("heading", { name: "Marina local (cópia local)", exact: true })).toBeVisible();
    await other.getByRole("button", { name: /Marina remota/ }).click();
    await other.getByRole("button", { name: "Excluir amigo", exact: true }).click();
    await other.getByRole("button", { name: "Sim, excluir", exact: true }).click();
    await expect(other.getByRole("dialog")).toHaveCount(0);
    await expect(other.getByText("Dados sincronizados com sua conta", { exact: true })).toBeVisible();
    await syncNow(page);
    await expect(page.getByRole("heading", { name: "Marina remota", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Marina local (cópia local)", exact: true })).toBeVisible();
  } finally { await second.close(); }
});
