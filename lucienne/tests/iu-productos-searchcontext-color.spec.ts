import { test, expect } from '@playwright/test';

test("buscar por color", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "PRODUCTOS" }).click();

  const search = page.getByRole("textbox", { name: /buscar producto/i });
  await search.fill("azul");

  // Producto 1
  await expect(page.getByRole("heading", { name: "pijama" }).first()).toBeVisible();

  // Producto 2: pijama largo test
  await expect(page.getByRole("heading", { name: /pijama largo test/i })).toBeVisible();

  // Color dentro de la tarjeta
  const card = page.getByRole("heading", { name: /pijama largo test/i }).locator("..");

  await expect(card.getByText(/azul/i)).toBeVisible();
  await expect(card.getByText(/35\.?000/)).toBeVisible();
});
