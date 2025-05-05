import { test, expect } from '@playwright/test';

test('Login exitoso con credenciales correctas', async ({ page }) => {
  // Navegar a la página de login
  await page.goto('http://localhost:5173/login');
  
  // Completar los campos del formulario de login
  await page.fill('#email', 'admin@test.com'); // Usar un email válido
  await page.fill('#password', '123456'); // Usar una contraseña válida
  
  // Hacer clic en el botón de submit
  await page.click('button[type="submit"]');
  
  // Verificar que la página de bienvenida o dashboard se cargue
  await expect(page.locator('text=Bienvenido')).toBeVisible();
  
  // Opcionalmente, verificar que la URL haya cambiado a la página de destino (por ejemplo, el dashboard)
  await expect(page).toHaveURL('http://localhost:5173/dashboard');
});
