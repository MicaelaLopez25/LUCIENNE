import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Ver Carrito' }).click();
  await expect(page.getByText('Vestido "LUCIENNE" Noche')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Vestido "LUCIENNE" NocheNEGRO SROJO M\$125\.99\$125\.99×$/ }).getByRole('combobox')).toBeVisible();
  await expect(page.getByText('$').first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Vestido "LUCIENNE" NocheNEGRO SROJO M\$125\.99\$125\.99×$/ }).getByRole('spinbutton')).toBeVisible();
  await expect(page.getByText('$').nth(1)).toBeVisible();
  await expect(page.locator('div').filter({ hasText: 'Cárdigan TejidoBEIGE MGRIS M' }).nth(3)).toBeVisible();
  await expect(page.getByText('Cárdigan Tejido')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Cárdigan TejidoBEIGE MGRIS M\$55\.00\$165\.00×$/ }).getByRole('combobox')).toBeVisible();
  await expect(page.getByText('$55.00')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Cárdigan TejidoBEIGE MGRIS M\$55\.00\$165\.00×$/ }).getByRole('spinbutton')).toBeVisible();
  await expect(page.getByText('$165.00')).toBeVisible();
  await expect(page.getByText('$290.99')).toBeVisible();
});