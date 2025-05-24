import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Se crea un usuario valido', async ({ page }) => {
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
await page.fill('input[name="dni"]', '12345678');
// Abrir el campo de Fecha de Nacimiento
await page.getByPlaceholder('Seleccione una fecha').first().click(); // Usa .first() si hay dos iguales
// Esperar a que aparezca el mes y año esperados
await expect(page.locator('.react-datepicker__current-month')).toHaveText(/mayo 2025/i);
// Seleccionar el día 19 (asegurate de que no tenga clases de fuera de mes como --outside-month)
await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();
await page.fill('input[name="email"]', 'empleado3@gmail.com');
await page.fill('input[name="password"]', '123456');
await page.fill('input[name="confirmPassword"]', '123456');
await page.fill('input[name="phone"]', '1109899765');
// Fecha de Ingreso a la Empresa
await page.getByPlaceholder('Seleccione una fecha').nth(1).click(); // Usa .first() si hay dos iguales
// Esperar a que aparezca el mes y año esperados
await expect(page.locator('.react-datepicker__current-month')).toHaveText(/mayo 2025/i);
// Seleccionar el día 19 (asegurate de que no tenga clases de fuera de mes como --outside-month)
await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

await page.selectOption('select[name="department"]', { label: 'Tecnología' });
await page.selectOption('select[name="role_name"]', { value: 'supervisor' });
await page.click('button:has-text("Guardar Usuario")');
// Espera a que la URL cambie a la página de usuarios
  await page.waitForURL('http://localhost:5173/users', { timeout: 5000 });
// Verifica que la URL actual sea la de usuarios
  await expect(page).toHaveURL('http://localhost:5173/users');

});
