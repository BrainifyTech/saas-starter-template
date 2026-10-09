import { expect, test } from "@playwright/test";

// The smoke test: the product boots and a visitor can reach sign-in. New
// journeys (sign up, create a record, sign in again and find it) go beside
// this file, one spec per journey a person would describe.

test("a visitor can reach email sign-in", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.getByRole("link", { name: /sign in with email/i }).click();
  await expect(page).toHaveURL(/\/sign-in\/email$/);
  await expect(page.getByRole("textbox").first()).toBeVisible();
});
