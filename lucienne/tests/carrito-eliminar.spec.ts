import { test, expect } from '@playwright/test';

test('test: Eliminar producto y verificar carrito vacío', async ({ page }) => {

  await page.goto('http://localhost:3000/');

  await page.getByRole('button', { name: 'Ver Carrito' }).click();
  
 await expect(page.getByText('Vestido "LUCIENNE" NocheNEGRO SROJO M$125.99$125.99×')).toBeVisible();
  
  const itemLocator = page.locator('div').filter({ hasText: /^Vestido "LUCIENNE"/ });

 
  await itemLocator.getByLabel('Eliminar producto').click();

  await expect(itemLocator).not.toBeVisible();


});