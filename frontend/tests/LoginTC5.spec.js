import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Presionar ingresar con Campo contraseña vacio', async ({ page }) => {
  await login(page, 'empleado@gmail.com', '');

  // Esperar un momento para que la acción de login intente procesarse
  await page.waitForTimeout(1000);

  // Verificar que la URL sigue siendo la misma (por ejemplo, que contiene 'login')
  await expect(page).toHaveURL(/login/);
});

