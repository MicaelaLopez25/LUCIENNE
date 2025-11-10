import { test, expect } from "@playwright/test";

test("verificar el producto agotado y el stock visible (CORRECCIÓN FINAL)", async ({ page }) => {
  const PRODUCTO_CON_STOCK = /pijamadelanda/i; 
  const PRODUCTO_AGOTADO = /pijama/i;         

  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "PRODUCTOS" }).click();

  // --- 1. Localizar Contenedores (CORRECCIÓN CRÍTICA: USAR CLASE CSS) ---
  
  // 💡 USAR LA CLASE REAL DE TU CÓDIGO: .producto-card
  const cardProductoConStock = page
    .locator('.producto-card') 
    .filter({ has: page.getByText(PRODUCTO_CON_STOCK) }); 
  
  const cardProductoAgotado = page
    .locator('.producto-card') 
    .filter({ has: page.getByText(PRODUCTO_AGOTADO) });

  // --- 2. Verificar Stock Visible ('pijamadelanda') ---
  
  const stockVisibleLocator = cardProductoConStock.getByText(/stock: 1/i);
  // Esta línea debe funcionar ahora, ya que el contenedor es específico.
  await expect(stockVisibleLocator).toBeVisible(); 
  
  // --- 3. Simular Clic en el Producto Agotado ---
  
  const botonAgotado = cardProductoAgotado.getByRole("button", { name: "Agotado", exact: true });
  
  await expect(botonAgotado).toBeVisible();
  await expect(botonAgotado).toBeDisabled(); 

  // Manejar el mensaje de la aplicación (disparado por showMessage)
  // ... (código de manejo de diálogo/mensaje) ...

  await botonAgotado.click();

  // Verificar el mensaje de agotado (se genera en #message-box)
  await expect(page.locator('#message-box')).toHaveText(/Este producto está agotado/i);

  // Verificar el contador del carrito (si existe)
  await expect(page.getByText("CANTIDAD:").nth(3)).toBeVisible();
});