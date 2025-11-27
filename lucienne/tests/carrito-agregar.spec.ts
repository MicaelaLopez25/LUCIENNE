import { test, expect } from '@playwright/test';

test('agregar un prodcuto al carrito y verificar que los datos sean iguales (q se muestre)', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'PRODUCTOS' }).click();

  await expect(page.getByText('$10.000').first()).toBeVisible();
  await page.getByRole('button', { name: 'NEGRO' }).nth(2).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.locator('section div').filter({ hasText: '×Vestido corto voladoCOLORES:NEGROSeleccionado: NEGRO$10.000STOCK: 3Agregar al' }).getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Ver Carrito' }).click();
  await expect(page.getByText('Vestido corto volado')).toBeVisible();
  await expect(page.getByText('$10000.00').first()).toBeVisible();
  await expect(page.getByText('1', { exact: true }).nth(1)).toBeVisible();
});