import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate via Auth0", async ({ page }) => {
  await page.goto("http://localhost:3001/login");

  await page.waitForURL(/.*auth0\.com.*/);

  await page
    .getByLabel("Username or Email address")
    .fill("xevowic351@izeao.com");
  await page.locator('input[name="password"]').fill("maekjrl234#A");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await page.getByRole("button", { name: "Accept", exact: true }).click();

  await page.waitForURL("http://localhost:3001/");

  await page.context().storageState({ path: authFile });
});
