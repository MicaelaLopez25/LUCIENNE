import { test, expect } from "@playwright/test";

test("agregar_producto_con_dos_variantes", async ({ page }) => {
  await page.goto("http://localhost:3000/agregar-producto");

  // --- 1. DATOS BASE ---
  await page
    .getByRole("textbox", { name: "Título del Producto" })
    .fill("Pijama de Seda Test");
  await page
    .getByRole("spinbutton", { name: "Precio Base (por unidad)" })
    .fill("290000");

  // --- 2. VARIANTE 1 (Inicial) ---
  // Carga de imagen para la primera variante
  // NOTA: El selector 'Toca para subir la imagen de' es correcto para la primera
  await page
    .getByRole("button", { name: /Imagen 1/i })
    .setInputFiles("pijamaazul.jpeg");

  // Llenado de campos de la primera variante
  await page.getByLabel("Color").first().fill("Azul");
  await page.getByLabel("Stock").first().fill("2");

  // --- 3. AÑADIR Y LLENAR VARIANTE 2 ---
  await page.getByRole("button", { name: "Añadir otra Variante" }).click();

  // La segunda variante ahora es la última en el DOM
  const variant2 = page.locator(".variant-row").last();

  // Carga de imagen para la SEGUNDA variante (usamos el selector dentro del contenedor)
  await variant2
    .getByRole("button", { name: /Imagen 2/i })
    .setInputFiles("pijamanegro.jpeg");

  // Llenado de campos de la SEGUNDA variante (usamos el selector dentro del contenedor)
  await variant2.getByLabel("Color").fill("Negrito");
  await variant2.getByLabel("Stock").fill("5");

  // --- 4. GUARDAR Y VERIFICAR ---
  await page
    .getByRole("button", { name: "GUARDAR PRODUCTO Y VARIANTES" })
    .click();

  // Esperamos que el mensaje de éxito aparezca antes de redirigir
  await expect(page.locator(".status-message.success")).toBeVisible();

  // Verificación en la página de productos (asumiendo que redirige a /productos)
  await page.waitForURL("http://localhost:3000/productos");

  // Los productos de la variante individual deben ser visibles
  await expect(
    page.getByText("Pijama de Seda Test", { exact: true }).first()
  ).toBeVisible();
  await expect(
    page.getByText("$290.000", { exact: true }).first()
  ).toBeVisible();

  // Si la lista de productos tiene el título dos veces (una por cada variante guardada)
  await expect(
    page.getByText("Pijama de Seda Test", { exact: true })
  ).toHaveCount(2);
});
