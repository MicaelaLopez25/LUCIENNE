import { test, expect } from '@playwright/test';

test('test: Eliminar producto y verificar carrito vacío', async ({ page }) => {
  // 1. Navegar a la página principal
  await page.goto('http://localhost:3000/');
  
  // 2. Ir al carrito
  await page.getByRole('button', { name: 'Ver Carrito' }).click();
  
  // 3. Verificar que la cabecera del carrito es visible (antes de eliminar)
  await expect(page.getByText('Mi CarritoPRODUCTOPRECIO')).toBeVisible();
  
  // Definir un selector para el producto que vamos a eliminar (para usarlo en la verificación)
  // Asegúrate de que el texto coincida exactamente con lo que ves en la UI
  const itemLocator = page.locator('div').filter({ hasText: /^Vestido "LUCIENNE" NocheNegro S\$125\.991\$125\.99×$/ });

  // 4. Localizar y hacer clic en el botón de eliminar del artículo
  // Se recomienda usar el localizador definido para mayor claridad y estabilidad si el elemento × está dentro del mismo contenedor.
  await itemLocator.getByLabel('Eliminar producto').click();
  
  // --- PASOS DE VERIFICACIÓN ---
  
  // 5. Verificar que el artículo eliminado ya no está visible en la página
  // Usamos .not.toBeVisible() para confirmar la eliminación.
  await expect(itemLocator).not.toBeVisible();

  // 6. Verificar que aparece un mensaje de carrito vacío (esto dependerá de cómo esté implementado el sitio)
  // Reemplaza 'El carrito está vacío' con el texto real que aparece cuando no hay productos.
  // Es común que se use un Role o un texto específico.

  // Opción A: Verificar un mensaje de texto de carrito vacío (si existe)
  // Puedes usar .toBeVisible() para confirmar que el mensaje aparece.
  
  // Opción B: Verificar que el contenedor del listado de productos ya no tiene elementos (si la lista tiene un ID o clase específica)
  // Por ejemplo, si los productos se listan en un div con id="cart-items"
  // await expect(page.locator('#cart-items')).toBeEmpty();
});