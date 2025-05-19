import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('ingreso con usuario erroneo', async ({ page }) => {
  // Realizar el login con el helper
  await login(page, 'emplead@gmail.com', '123456');

  // Localizar el mensaje de error (suponiendo que aparezca en un elemento específico)
  const errorMessage = page.locator('text=Credenciales incorrectas');

  // Verificar que el mensaje esté visible y tenga el texto esperado
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText(/Credenciales incorrectas/i);
});
