import { test, expect } from '@playwright/test';

test('Login exitoso con credenciales correctas', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('#username', 'cliente@gmail.com');  // Ejemplo de credenciales válidas
  await page.fill('#password', '1234');
  await page.click('button[type="submit"]');

  // Verificar que la URL cambió correctamente después de hacer login
  await expect(page).toHaveURL('http://localhost:5173/employee');  // Cambiar a la URL correcta
});
