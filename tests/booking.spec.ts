import { test, expect } from "@playwright/test";

const PROPERTY_PATH =
  "http://localhost:3001/property/32825c3b-47ec-493c-947e-64046ad9c815";

const BOOKING_PAGE_BASE = "http://localhost:3001/bookings/new";

test.describe("Create Booking Flow", () => {
  test("should successfully create a booking with valid dates and room", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.goto(PROPERTY_PATH);

    await page.getByRole("button", { name: "Request Booking" }).click();

    // Should navigate to the dedicated booking page
    await expect(page).toHaveURL(/\/bookings\/new\?propertyId=/);
    await expect(
      page.getByText("Loading rooms...", { exact: false }),
    ).not.toBeVisible({ timeout: 30000 });

    await page
      .getByRole("button", { name: "Select check-in and check-out dates" })
      .click();

    // Use regex to partially match the full accessible name (e.g., "Friday, April 10th, 2026")
    await page.getByRole("button", { name: /10th/ }).first().click();
    await page.getByRole("button", { name: /15th/ }).first().click();

    await page.keyboard.press("Escape");

    const firstRoom = page.getByTestId("room-card-select").first();
    await firstRoom.click();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/booking") &&
        response.status() >= 200 &&
        response.status() < 300,
    );

    await page.getByRole("button", { name: "Confirm Booking" }).click();
    await responsePromise;

    await expect(page.getByText("Booking Request Sent")).toBeVisible();
    await expect(page).toHaveURL(/.*\/yourBookings/);
  });

  test("should block submission and show Zod errors when fields are missing", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.goto(PROPERTY_PATH);

    await page.getByRole("button", { name: "Request Booking" }).click();
    await expect(page).toHaveURL(/\/bookings\/new\?propertyId=/);
    await expect(
      page.getByText("Loading rooms...", { exact: false }),
    ).not.toBeVisible({ timeout: 30000 });

    await page.getByRole("button", { name: "Confirm Booking" }).click();

    // Should still be on the booking page with validation errors
    await expect(page).toHaveURL(/\/bookings\/new\?propertyId=/);
    await expect(
      page.getByText("Invalid input: expected object, received undefined"),
    ).toBeVisible();
    await expect(page.getByText("Please select a room")).toBeVisible();
  });
});
