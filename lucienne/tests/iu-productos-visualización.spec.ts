import { test, expect } from "@playwright/test";

test("test sobre la visualización en productos de un producto", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");
  await page.getByRole("link", { name: "PRODUCTOS" }).click();

  // 💡 Busca el producto que sí existe en tu base de datos
  await page.locator("div", { hasText: "pijamadelanda" }).first().click();

  await expect(
    page.getByRole("heading", { name: "pijamadelanda" }).first()
  ).toBeVisible();
});
