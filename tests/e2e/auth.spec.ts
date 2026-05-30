import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function login(page: Page, redirectPath = "/repositories") {
  await page.goto(`/login?redirectTo=${encodeURIComponent(redirectPath)}`);
  await expect(page.getByRole("button", { name: "ログイン" })).toBeEnabled();

  await page.getByPlaceholder("user@example.com").fill("tanaka@example.com");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL(
    new RegExp(`${redirectPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
    { timeout: 15000 },
  );
}

test("protected repositories route redirects to login and returns after sign in", async ({ page }) => {
  await page.goto("/repositories");

  await expect(page).toHaveURL(/\/login\?redirectTo=%2Frepositories/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ログイン" })).toBeEnabled();

  await page.getByPlaceholder("user@example.com").fill("tanaka@example.com");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL(/\/repositories$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Repositories" })).toBeVisible();
  await expect(page.getByLabel("repositories-overview")).toBeVisible();
});

test("authenticated user visiting login is redirected to redirectTo target", async ({ page }) => {
  await login(page, "/repositories");

  await page.goto("/login?redirectTo=%2Frepositories");

  await expect(page).toHaveURL(/\/repositories$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Repositories" })).toBeVisible();
});

test("logout clears access to protected routes", async ({ page }) => {
  await login(page, "/repositories");

  await page.getByRole("button", { name: "ログアウト" }).first().click();

  await expect(page).toHaveURL(/\/login$/, { timeout: 15000 });
  await page.goto("/repositories");
  await expect(page).toHaveURL(/\/login\?redirectTo=%2Frepositories/);
});

test("login page shows session-expired message when reason is provided", async ({ page }) => {
  await page.goto("/login?reason=session-expired&redirectTo=%2Frepositories");

  await expect(page.getByText("セッションの有効期限が切れました。再度ログインしてください。")).toBeVisible();
});