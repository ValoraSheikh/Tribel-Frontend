import { test, expect } from "@playwright/test";

test.describe("Edit Profile Flow", () => {
  test("should successfully update the profile with valid data", async ({
    page,
  }) => {
    await page.goto("http://localhost:3001/profile");

    // 2. Interact with the UI
    await page.getByTestId("edit-profile-trigger").click();

    await expect(
      page.getByRole("heading", { name: "Edit profile" }),
    ).toBeVisible();

    await page.getByLabel("First Name").fill("Aman");
    await page.getByLabel("Last Name").fill("Sheikh");
    await page.getByLabel("Phone").fill("9876543210");

    await page.getByRole("button", { name: "Save changes" }).click();

    // 3. Assertions
    await expect(
      page.getByRole("heading", { name: "Edit profile" }),
    ).toBeHidden();
    await expect(
      page.getByText("You submitted the following values:"),
    ).toBeVisible();
  });
});
