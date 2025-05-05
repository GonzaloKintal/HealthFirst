import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta

test('Se agrega empleado nuevo al sistema', async ({ page }) => {
    await login(page, 'juansaltiva2000@gmail.com', '1234');
    await expect(page).toHaveURL('http://localhost:5173/admin', { timeout: 10000 });
    await page.getByRole('link', { name: 'Usuarios' }).click();
    await page.getByRole('link', { name: 'Nuevo Usuario' }).click(),{timeout: 5000};

    
  
  });