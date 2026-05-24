import { expect, test } from "@playwright/test";

test("home renders new app heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "New App" })).toBeVisible();
});
