import { test, expect } from '@playwright/test';

test('ver productos en carrito, con nombre, precio, cantidad y tota', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Ver Carrito' }).click();
  await expect(page.getByText('Vestido "LUCIENNE" Noche')).toBeVisible();
  await expect(page.getByText('$').first()).toBeVisible();
  await page.getByRole('main').getByText('1', { exact: true }).click();
  await expect(page.getByText('$').first()).toBeVisible();
  await expect(page.getByRole('main').getByText('1', { exact: true })).toBeVisible();
  await expect(page.getByText('$').nth(1)).toBeVisible();
  await expect(page.getByText('Cárdigan Tejido')).toBeVisible();
  await expect(page.getByText('$55.00')).toBeVisible();
  await expect(page.getByText('3')).toBeVisible();
  await expect(page.getByText('$165.00')).toBeVisible();
  await expect(page.getByText('$290.99')).toBeVisible();
});