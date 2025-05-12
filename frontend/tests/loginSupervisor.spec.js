// test/pedir_loginSupervisor.spec.js
import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta

test('Login exitoso del supervisor', async ({ page }) => {
  // Realiza el login
  await login(page, 'supervisor@gmail.com', '123456');
  // Verifica que la URL sea la del supervisor después de loguearse
  await expect(page).toHaveURL('http://localhost:5173/supervisor', { timeout: 10000 });
  
});

