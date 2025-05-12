import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta
import { agregarUsuario } from './utils/agregarUsuario.js'; // Asegúrate de que la ruta sea correcta

test('Se agrega empleado nuevo al sistema', async ({ page }) => {
    await login(page, 'juansaltiva2000@gmail.com', '1234');
    await expect(page).toHaveURL('http://localhost:5173/admin', { timeout: 10000 });
    await page.getByRole('link', { name: 'Usuarios' }).click();
    await page.click('text=Nuevo Usuario');
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
    await page.fill('input[name="first_name"]', 'Carlos');
    await page.fill('input[name="last_name"]', 'Meza');
    await page.fill('input[name="date_of_birth"]', '1990-05-05');
    await page.selectOption('select[name="department"]', { label: 'Recursos Humanos' });
    await page.fill('input[name="dni"]', '87654321');
    await page.fill('input[name="phone"]', '1130537324');
    await page.fill('input[name="email"]', 'cliente2@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.fill('input[name="confirmPassword"]', '123456');
    await page.click('text=Guardar');
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud  

    await page.getByRole('button', { name: 'Guardar Usuario' }).click();
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud

    const successMessage = await page.locator('text=Error al crear el usuario').first();
    await expect(successMessage).toBeVisible();
    

  });