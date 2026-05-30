import { expect, test } from "@playwright/test";

test("home redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login\?redirectTo=%2F/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/v1/health");
  const json = (await response.json()) as { ok: boolean; service: string };

  expect(response.ok()).toBeTruthy();
  expect(json.ok).toBeTruthy();
  expect(json.service).toBe("qapybara-api");
});
