import { test, expect } from "@playwright/test";
import { fillBirthday } from "./birthday";
test("cadastro, preferências, presente, persistência e exclusão", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator(".add-friend").click();
  await page
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("Marina Teste");
  await fillBirthday(page, "1998-09-28");
  await page.getByLabel("♡ Coisas que ama").fill("Café e livros de fantasia");
  await page.getByLabel("Coisas que não gosta").fill("Chocolate branco");
  await page.getByRole("button", { name: "Salvar amigo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: /Marina Teste.*28 de setembro/ })
    .click();
  await expect(
    page.getByText("Café e livros de fantasia", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Nova ideia").fill("Livro especial");
  await page.getByLabel("Link da loja").fill("https://example.com/livro");
  await page.getByLabel("Detalhes").fill("Capa dura");
  await page.getByRole("button", { name: "Adicionar ideia" }).click();
  await page.getByRole("checkbox", { name: /Livro especial/ }).check();
  await expect(
    page.getByRole("checkbox", { name: /Livro especial/ }),
  ).toBeChecked();
  await page.getByRole("dialog").evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.screenshot({
    path: `test-results/profile-${testInfo.project.name}.png`,
    scale: "css",
  });
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(page.getByLabel("♡ Coisas que ama")).toHaveValue(
    "Café e livros de fantasia",
  );
  await page
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("Marina Jardim");
  await page.getByRole("button", { name: "Salvar amigo" }).click();
  await expect(
    page.getByRole("checkbox", { name: /Livro especial/ }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: /Marina Jardim.*28 de setembro/ })
    .click();
  await expect(
    page.getByText("Chocolate branco", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /Livro especial/ }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.goto("/gifts");
  await page.getByRole("button", { name: "Comprados", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Livro especial/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Livro especial/ }).click();
  await page
    .getByRole("button", { name: "Excluir amigo", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Marina Jardim" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Excluir amigo", exact: true })
    .click();
  await page.getByRole("button", { name: "Sim, excluir", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/people");
  await expect(page.getByText("Nenhum amigo cadastrado")).toBeVisible();
  expect(errors).toEqual([]);
});
test("calendário, navegação e limites da tela", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Calendário de aniversários" }),
  ).toBeVisible();
  const month = await page.locator(".calendar-toolbar h2").textContent();
  await page.getByRole("button", { name: "Próximo mês" }).click();
  await expect(page.locator(".calendar-toolbar h2")).not.toHaveText(month!);
  await page.getByRole("button", { name: "Hoje", exact: true }).click();
  await expect(page.locator(".calendar-toolbar h2")).toHaveText(month!);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/calendar-${testInfo.project.name}.png`,
    fullPage: true,
    scale: "css",
  });
  await page.locator(".add-friend").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".add-friend")).toBeFocused();
});
test("preserva registros do modelo original", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".add-friend")).toBeEnabled();
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("beloved-calendar-db", 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("people", "readwrite");
        transaction.objectStore("people").put({
          id: "legacy",
          name: "Amigo antigo",
          birthDate: "2000-02-29",
          notes: "Nota preservada",
          image: "/old-image.png",
          gifts: [
            {
              id: "gift-old",
              title: "Presente antigo",
              notes: "Detalhe original",
            },
          ],
        });
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
      request.onerror = () => reject(request.error);
    });
  });
  await page.goto("/people");
  await page.getByRole("button", { name: /Amigo antigo/ }).click();
  await expect(page.getByText("Nota preservada")).toBeVisible();
  await expect(
    page.getByText("Presente antigo", { exact: true }),
  ).toBeVisible();
  await page.getByRole("dialog").evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.screenshot({
    path: `test-results/profile-${testInfo.project.name}.png`,
    scale: "css",
  });
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("♡ Coisas que ama").fill("Plantas");
  await page.getByRole("button", { name: "Salvar amigo" }).click();
  await expect(
    page.getByText("Presente antigo", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Nota preservada")).toBeVisible();
});

test("abre e permite cadastrar sem internet após preparar o cache", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.locator(".add-friend")).toBeEnabled();
  const cachedAssets = await page.evaluate(async () => {
    const stores = await caches.keys();
    const urls = await Promise.all(
      stores.map(async (key) =>
        (await (await caches.open(key)).keys()).map((request) => request.url),
      ),
    );
    return urls.flat();
  });
  expect(cachedAssets.some((url) => url.includes("pixel-landscape.svg"))).toBe(
    true,
  );
  expect(
    cachedAssets.some(
      (url) => url.includes("pixelify-sans") && url.includes("woff2"),
    ),
  ).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.locator(".add-friend").click();
  await page
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("Amigo offline");
  await fillBirthday(page, "2000-12-12");
  await page.getByRole("button", { name: "Salvar amigo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Amigo offline.*12 de dezembro/ }),
  ).toBeVisible();
});
