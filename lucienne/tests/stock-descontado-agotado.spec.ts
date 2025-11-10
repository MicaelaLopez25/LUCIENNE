import { test, expect } from "@playwright/test";

test("verificar el producto agotado (PIJAMA con STOCK 0)", async ({ page }) => {
  // 1. Configuración de Selectores
  // Usamos Expresiones Regulares para ignorar mayúsculas y minúsculas (más robusto)
  const PRODUCTO_CON_STOCK = /pijamadelanda/i; 
  const PRODUCTO_AGOTADO = /pijama/i;         

  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "PRODUCTOS" }).click();

  // --- 2. Localizar Contenedores (La Corrección Crucial) ---
  // Dado que getByRole('article') falló, usamos locator('div') que es el contenedor más común.
  // Playwright busca un <div> que contenga el nombre del producto PIJAMA.
  const cardProductoAgotado = page
    .locator('div') 
    .filter({ has: page.getByText(PRODUCTO_AGOTADO) }); 
  
  // Localizamos el contenedor del otro producto para referencia
  const cardProductoConStock = page
    .locator('div') 
    .filter({ has: page.getByText(PRODUCTO_CON_STOCK) });

  // --- 3. Afirmación 1: Verificar la visibilidad del producto con Stock 1 ---
  
  // 💡 Afirmación sobre el Stock: Buscamos el texto "STOCK: 1" dentro del contenedor.
  // Usamos RegEx /stock: 1/i para ignorar mayúsculas.
  const stockVisibleLocator = cardProductoConStock.getByText(/stock: 1/i);
  await expect(stockVisibleLocator).toBeVisible(); 
  
  // --- 4. Simular Clic en el Producto Agotado ---
  
  // Buscamos el botón AGOTADO dentro del contenedor del producto agotado.
  const botonAgotado = cardProductoAgotado.getByRole("button", { name: "AGOTADO", exact: true });
  
  // Verificamos que el botón agotado esté visible y deshabilitado (no se puede comprar).
  await expect(botonAgotado).toBeVisible();
  await expect(botonAgotado).toBeDisabled(); 

  // --- 5. Manejar el Diálogo y Simular el Clic ---
  
  // Configuramos el manejo del diálogo ANTES de hacer el clic.
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  
  // Hacemos clic en el botón AGOTADO para simular el intento de compra que debe lanzar el diálogo.
  await botonAgotado.click();

  // --- 6. Verificar el Contador del Carrito (Pendiente de tu corrección de selector) ---
  
  // Esta línea es muy frágil. Si sigue fallando, debes revisar el selector en el carrito.
  // Si tu aplicación muestra "CANTIDAD:" en alguna parte, lo buscamos.
  await expect(page.getByText("CANTIDAD:").nth(3)).toBeVisible();
});