import { test, expect } from "@playwright/test";
import { fillBirthday } from "./birthday";

test("perfil e formulários opcionais preservam o acesso como visitante", async ({
  page,
}, testInfo) => {
  const email = `beloved-e2e-${testInfo.project.name}-${crypto.randomUUID()}@example.com`;
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Calendário de aniversários" }),
  ).toBeVisible();
  await page.locator(".add-friend").click();
  await page.getByLabel("Nome", { exact: true }).fill("Amiga visitante");
  await fillBirthday(page, "2000-10-10");
  await page.getByRole("button", { name: "Salvar amigo", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const navigation = page.getByRole("navigation", {
    name:
      testInfo.project.name === "mobile"
        ? "Navegação principal móvel"
        : "Navegação principal",
    exact: true,
  });
  await navigation.getByRole("link", { name: "Perfil", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Meu perfil", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Criar uma conta", exact: true })
    .click();
  await page.getByLabel("Nome", { exact: true }).fill("Marina");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("exemplo123");
  await page
    .getByLabel("Confirmar senha", { exact: true })
    .fill("diferente123");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "As senhas não coincidem",
  );
  await page.getByLabel("Confirmar senha", { exact: true }).fill("exemplo123");
  await page.getByLabel("Mostrar senhas", { exact: true }).check();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Olá, Marina!" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sair da conta" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/account-register-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/perfil$/);
  await page.getByRole("button", { name: "Sair da conta" }).click();
  await page
    .getByRole("link", { name: "Entrar na minha conta", exact: true })
    .click();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await expect(
    navigation.getByRole("link", { name: "Perfil", exact: true }),
  ).toHaveClass(/active/);
  await page.screenshot({
    path: `test-results/account-login-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Entrar na sua conta" }),
  ).toBeVisible();
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("errada123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Email ou senha incorretos",
  );
  await page.getByLabel("Senha", { exact: true }).fill("exemplo123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Olá, Marina!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sair da conta" }).click();
  await expect(
    page.getByRole("link", { name: "Entrar na minha conta" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Entrar na minha conta" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Continuar sem entrar" }).click();
  await expect(page.locator(".add-friend")).toBeEnabled();
  await page.goto("/people");
  await expect(
    page.getByRole("heading", { name: "Amiga visitante" }),
  ).toBeVisible();
});

test("API indisponível mantém o calendário e explica falha no login", async ({
  page,
}) => {
  await page.route("**/api/**", (route) => route.abort());
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill("marina@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("exemplo123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível conectar",
  );
  await page.getByRole("link", { name: "Continuar sem entrar" }).click();
  await expect(page.locator(".add-friend")).toBeEnabled();
});
