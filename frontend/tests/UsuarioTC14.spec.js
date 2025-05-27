import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Crear usuario válido (DNI al borde inferior de clase válida) )', async ({ page }) => {
  await login(page, 'admin@admin.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/admin');

  // Ir a sección Usuarios
  await page.locator('span.ml-3.font-medium', { hasText: 'Usuarios' }).click();

  // Crear nuevo usuario
  await page.click('text=Nuevo Usuario');

  // Completar formulario (nombre vacío)
  await page.fill('input[name="first_name"]', 'Juan');
  await page.fill('input[name="last_name"]', 'Saltiva');

  await page.fill('input[name="dni"]', '10000000');

  // Fecha de nacimiento
  await page.getByPlaceholder('Seleccione una fecha').first().click();
  await page.click('.react-datepicker__year-dropdown-container--select');
  await page.selectOption('select.react-datepicker__year-select', '1988');
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  // Otros campos
  await page.fill('input[name="email"]', 'TC14@gmail.com');
  await page.fill('input[name="password"]', '123456');
  await page.fill('input[name="confirmPassword"]', '123456');
  await page.fill('input[name="phone"]', '1109899765');

  // Fecha de ingreso
  await page.getByPlaceholder('Seleccione una fecha').nth(1).click();
  await expect(page.locator('.react-datepicker__current-month')).toHaveText(/mayo 2025/i);
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  // Departamento y rol
  await page.selectOption('select[name="department"]', { label: 'Tecnología' });
  await page.selectOption('select[name="role_name"]', { value: 'supervisor' });

  // Forzar el botón de envío
  await page.click('button:has-text("Guardar Usuario")');
  await page.waitForTimeout(5000); // Espera para que se procese el formulario
  // Espera a que la URL cambie a la página de usuarios
  await page.waitForURL('http://localhost:5173/users', { timeout: 5000 });
// Verifica que la URL actual sea la de usuarios
  await expect(page).toHaveURL('http://localhost:5173/users');

});
