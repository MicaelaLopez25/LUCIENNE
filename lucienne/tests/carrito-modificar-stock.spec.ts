import { test, expect } from '@playwright/test';

test('cuando se modifica la cantidad de un articulo en el total tmb', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Ver Carrito' }).click();
  await page.locator('div').filter({ hasText: '×' }).nth(4).click();
  await expect(page.getByRole('spinbutton')).toBeVisible();
  await expect(page.getByText('$').nth(1)).toBeVisible();
  await expect(page.locator('span').filter({ hasText: '$' })).toBeVisible();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').press('ArrowUp');
  await page.getByRole('spinbutton').fill('2');
  await expect(page.getByRole('spinbutton')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^\$251\.98$/ })).toBeVisible();
  await expect(page.locator('span').filter({ hasText: '$' })).toBeVisible();
});