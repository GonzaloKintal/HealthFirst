import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('ingreso con contraseña erronea', async ({ page }) => {
  // Realizar el login con el helper
  await login(page, 'empleado@gmail.com', '12345');

  // Localizar el mensaje de error (suponiendo que aparezca en un elemento específico)
  const errorMessage = page.locator('text=Credenciales incorrectas');

  // Verificar que el mensaje esté visible y tenga el texto esperado
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText(/Credenciales incorrectas/i);
});
