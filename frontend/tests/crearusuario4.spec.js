import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Crear un usuario con una contraseña de 5 caracteres', async ({ page }) => {
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
await page.fill('input[name="last_name"]', 'flores');
await page.fill('input[name="employment_start_date"]', '2025-06-01');
await page.fill('input[name="dni"]', '12345678');
await page.fill('input[name="date_of_birth"]', '1990-05-18');
await page.fill('input[name="email"]', 'empleado3@gmail.com');
await page.fill('input[name="password"]', '12345');
await page.fill('input[name="confirmPassword"]', '12345');
await page.fill('input[name="phone"]', '1109899765');
await page.selectOption('select[name="department"]', { label: 'Tecnología' });
await page.selectOption('select[name="role_name"]', { value: 'supervisor' });
await page.click('button:has-text("Guardar Usuario")');
// Espera a que la URL cambie a la página de usuarios

 const errorLocator = page.locator('text=La contraseña debe tener al menos 6 caracteres');
  await expect(errorLocator).toBeVisible();


});
