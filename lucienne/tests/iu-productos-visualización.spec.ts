import { test, expect } from "@playwright/test";

test("test sobre la visualizacion en productos de un producto ", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "PRODUCTOS" }).click();
  await page
    .locator("div")
    .filter({ hasText: "Nueva Pijama de Prueba$" })
    .nth(1)
    .click();
  await expect(
    page.getByRole("heading", { name: "Nueva Pijama de Prueba" }).first()
  ).toBeVisible();
});
