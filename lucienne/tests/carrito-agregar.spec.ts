import { test, expect } from '@playwright/test';

test('Verificar la adición de pijama largo test al carrito y sus detalles', async ({ page }) => {
    // 1. Navegar a la página principal
    await page.goto('http://localhost:3000/');

    // 2. Ir a la página de productos
    await page.getByRole('link', { name: 'PRODUCTOS' }).click();

    // 3. Seleccionar el color AZUL (Usamos el botón específico que funciona)
    const azulButton = page.getByRole('button', { name: 'AZUL' }).nth(3);
    await azulButton.click();

    // 4. Manejar el diálogo de confirmación (Debe estar ANTES del click que lo dispara)
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => {});
    });

    // 5. Agregar al carrito
    // Buscamos el botón 'Agregar al Carrito' dentro del contenedor que tiene el producto.
    const productContainer = page.locator('div', { has: page.getByRole('heading', { name: 'pijama largo test' }) });
    
    // Este selector es más robusto para encontrar el botón de agregar
    await productContainer.getByRole('button', { name: /Agregar al Carrito/i }).click();

    // 6. Navegar al carrito
    // Hacemos clic y esperamos explícitamente a que se cargue la nueva URL.
    await page.getByRole('button', { name: 'Ver Carrito' }).click();
    await page.waitForURL('http://localhost:3000/carrito'); // Aseguramos que la navegación se complete
    
    // --- VERIFICACIONES EN LA PÁGINA DEL CARRITO ---
    
    // 7. Localizar el elemento que contiene el nombre del producto
    // Confirmado en el snapshot, es un <paragraph> con el texto exacto.
    const productNameParagraph = page.getByRole('paragraph', { name: 'pijama largo test', exact: true });

    // 8. Verificar que el nombre del producto es visible (¡Este es el FIX principal!)
    // Playwright esperará automáticamente a que este elemento aparezca.
    await expect(productNameParagraph).toBeVisible(); 

    // 9. Localizar la Fila Completa para verificar el resto de los datos
    // Subimos al contenedor de la fila principal (3 veces '..')
    const cartItemRow = productNameParagraph.locator('..').locator('..').locator('..'); 

    // 10. Verificar el color (AZUL) dentro de la fila
    await expect(cartItemRow.getByText('AZUL', { exact: true })).toBeVisible();

    // 11. Verificar el precio unitario exacto: $35000.00 dentro de la fila
    await expect(cartItemRow.getByText('$35000.00', { exact: true })).toBeVisible();
    
    // 12. Verificar el Total (Opcional, pero bueno para confirmar la página)
    await expect(page.getByText('TOTAL:')).toBeVisible();
});