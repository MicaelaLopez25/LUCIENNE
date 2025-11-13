import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'PRODUCTOS' }).click();
  await page.getByRole('textbox', { name: 'Buscar producto...' }).click();
  await page.getByRole('textbox', { name: 'Buscar producto...' }).fill('azul');
  await expect(page.getByRole('textbox', { name: 'Buscar producto...' })).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^pijamaCOLORES:AZUL\$120\.000$/ }).getByRole('button')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^pijama largo testCOLORES:AZUL\$35\.000$/ }).getByRole('button')).toBeVisible();
});