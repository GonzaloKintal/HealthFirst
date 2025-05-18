import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Intentar ingresar un usuario con campo nombre sin completar', async ({ page }) => {
  await login(page, 'admin@admin.com', '123456');
    await expect(page).toHaveURL('http://localhost:5173/admin');

// apreta boton para ingresar a las seccion de usuarios 
  const userButton = await page.locator('span.ml-3.font-medium', { hasText: 'Usuarios' });
  await userButton.click();
// hacemos click en botoin de crear usuario
await page.click('text=Nuevo Usuario');
// debemos cargar los datos 


// Luego usas ese objeto para llenar el formulario:
await page.fill('input[name="first_name"]', 'Luis');
await page.fill('input[name="last_name"]', '');
await page.fill('input[name="employment_start_date"]', '2025-06-01');
await page.fill('input[name="dni"]', '12345678');
await page.fill('input[name="date_of_birth"]', '1990-05-18');
await page.fill('input[name="email"]', 'empleado3@gmail.com');
await page.fill('input[name="password"]', '123456');
await page.fill('input[name="confirmPassword"]', '123456');
await page.fill('input[name="phone"]', '1109899765');
await page.selectOption('select[name="department"]', { label: 'Tecnología' });
await page.selectOption('select[name="role_name"]', { value: 'supervisor' });
await page.click('button:has-text("Guardar Usuario")');
// Verifica que la URL actual sea la de usuarios
 expect(page.url()).toBe('http://localhost:5173/add-user'); 
});