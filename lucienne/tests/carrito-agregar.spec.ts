import { test, expect } from '@playwright/test';

test('agregar un articulo y verificar que el color y precio sea el mismo', async ({ page }) => {
   
    await page.goto('http://localhost:3000/');

    await page.getByRole('link', { name: 'PRODUCTOS' }).click();

    const azulButton = page.getByRole('button', { name: 'AZUL' }).nth(3);
    await azulButton.click();

    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => {});
    });

    
    await page.getByRole('button', { name: 'AGREGAR AL CARRITO' }).nth(2).click();

   
    await page.getByRole('button', { name: 'Ver Carrito' }).click();
    await page.waitForURL('http://localhost:3000/carrito'); 

    await expect(page.getByText('pijama largo testAZUL')).toBeVisible();


    await expect(page.getByText('$35000.00', { exact: true }).first()).toBeVisible();
    
   
    await expect(page.getByText('TOTAL:')).toBeVisible();
});