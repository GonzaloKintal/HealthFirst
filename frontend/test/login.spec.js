import { test, expect } from '@playwright/test';

test('Login exitoso del usuario cliente', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  // Ingresar credenciales válidas
  await page.fill('#username', 'cliente@gmail.com');
  await page.fill('#password', '1234');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:5173/employee', { timeout: 10000 });



});
