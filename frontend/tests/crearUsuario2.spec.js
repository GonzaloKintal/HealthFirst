import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Todos los campos vacios', async ({ page }) => {
  await login(page, 'admin@admin.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/admin');

  // apreta boton para ingresar a las seccion de usuarios 
  const userButton = await page.locator('span.ml-3.font-medium', { hasText: 'Usuarios' });
  await userButton.click();

  // hacemos click en boton de crear usuario
  await page.click('text=Nuevo Usuario');

  // Verifico que estoy en la página del formulario
  await expect(page).toHaveURL('http://localhost:5173/add-user'); // o la URL correcta que tengas para crear usuario

  // Sin completar datos intento guardar
  await page.click('button:has-text("Guardar Usuario")');
   await page.click('button:has-text("Guardar Usuario")');
    await page.click('button:has-text("Guardar Usuario")');
     await page.click('button:has-text("Guardar Usuario")');

  // Espero un poco para que intente cambiar de página si fuera a hacerlo
  await page.waitForTimeout(2000);

  // Verifico que la URL NO cambió, sigue en el formulario
  expect(page.url()).toBe('http://localhost:5173/add-user'); // debe coincidir con la URL del formulario

});
