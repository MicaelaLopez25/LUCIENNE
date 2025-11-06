import { test, expect } from "@playwright/test";

test("debería mostrar 'Agotado' cuando el stock llega a 0", async ({
  page,
}) => {
  await page.goto("http://localhost:3001/");
  await page.getByRole("link", { name: "PRODUCTOS" }).click();

  // 🧾 Verifica que el producto tenga stock 1 al inicio
  await expect(page.getByText("CANTIDAD: 1", { exact: true })).toBeVisible();

  // 🛒 Simula la compra
  page.once("dialog", (dialog) => {
    dialog.dismiss().catch(() => {});
  });

  // Usa .first() si solo hay un botón "Comprar"
  await page.getByRole("button", { name: "Comprar" }).first().click();

  // 💡 Espera a que el stock cambie o aparezca "Agotado"
  await expect(page.getByText(/Agotado/i)).toBeVisible({ timeout: 10000 });

  // 🚫 Verifica que ya no se pueda volver a comprar
  await expect(
    page.getByRole("button", { name: "Comprar" }).first()
  ).toBeDisabled();
});
