import { test, expect } from "@playwright/test";

test.setTimeout(120000);

test("Agregar producto con variantes e imágenes", async ({ page }) => {
  test.slow();
  await page.goto("http://localhost:3000/agregar-producto");

  await page.getByLabel("Título del Producto").fill("pijama largo test");
  await page.getByLabel("Precio Base (por unidad)").fill("35000");

  await page.getByPlaceholder("ej: Rojo").fill("Rojo");
  await page.getByPlaceholder("ej: 5").fill("10");

  const fileChooserPromise1 = page.waitForEvent("filechooser");
  await page.getByLabel("Toca para subir la imagen de la variante Rojo").click();
  const fileChooser1 = await fileChooserPromise1;
  await fileChooser1.setFiles({
    name: "mock-image1.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4DwQACfsD/QatR88AAAAASUVORK5CYII=",
      "base64"
    ),
  });

  await page.getByRole("button", { name: "Añadir otra Variante" }).click();
  const colorInputs = await page.getByPlaceholder("ej: Rojo").all();
  const stockInputs = await page.getByPlaceholder("ej: 5").all();

  await colorInputs[1].fill("Azul");
  await stockInputs[1].fill("8");

  const fileChooserPromise2 = page.waitForEvent("filechooser");
  await page.getByLabel("Toca para subir la imagen de la variante Azul").click();
  const fileChooser2 = await fileChooserPromise2;
  await fileChooser2.setFiles({
    name: "mock-image2.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4DwQACfsD/QatR88AAAAASUVORK5CYII=",
      "base64"
    ),
  });

  await page.getByRole("button", { name: "GUARDAR PRODUCTO Y VARIANTES" }).click();

  await expect(
    page.getByText(/Producto\(s\) agregado\(s\) con éxito!/i)
  ).toBeVisible({ timeout: 60000 });

  await page.waitForURL("**/productos", { timeout: 60000 });

  // ✅ Comprueba que al menos un título con ese nombre sea visible
  await expect(
    page.getByRole("heading", { name: "pijama largo test" }).first()
  ).toBeVisible({ timeout: 30000 });
});
