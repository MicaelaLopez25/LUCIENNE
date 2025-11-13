import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'PRODUCTOS' }).click();
  await page.getByRole('textbox', { name: 'Buscar producto...' }).click();
  await page.getByRole('textbox', { name: 'Buscar producto...' }).fill('pijama');
  await expect(page.getByRole('textbox', { name: 'Buscar producto...' })).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^pijama largo testCOLORES:ROJO\$35\.000$/ }).getByRole('heading')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'pijama', exact: true })).toBeVisible();
});