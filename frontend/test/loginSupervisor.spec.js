// test/pedir_loginSupervisor.spec.js
import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta

test('Login exitoso del supervisor', async ({ page }) => {
  await login(page, 'supervisor@gmail.com', '1234');
  await expect(page).toHaveURL('http://localhost:5173/supervisor', { timeout: 10000 });
  await page.click('text=Licencias');

});
