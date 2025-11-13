import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "PRODUCTOS" }).click();
  await expect(page.getByText("CANTIDAD: 1", { exact: true })).toBeVisible();
  // agregue exact: true para resolver el error de Playwright "Strict Mode Violation" forzando a que
  // el selector busque solo la cadena de texto "CANTIDAD: 1" e ignore otras coincidencias parciales
  // como "CANTIDAD: 10".
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole("button", { name: "Comprar" }).nth(1).click();
  await expect(page.getByText("CANTIDAD:").nth(3)).toBeVisible();
});
