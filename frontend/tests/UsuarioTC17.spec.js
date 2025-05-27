import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Crear usuario no válido (DNI con menos de 7 dígitos)', async ({ page }) => {
  await login(page, 'admin@admin.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/admin');

  // Ir a sección Usuarios
  await page.getByText('Usuarios', { exact: true }).click();

  // Crear nuevo usuario
  await page.click('text=Nuevo Usuario');

  await page.fill('input[name="first_name"]', 'Laura');
  await page.fill('input[name="last_name"]', 'González');

  await page.fill('input[name="dni"]', '777777'); // DNI inválido

  // Fecha de nacimiento
  await page.getByPlaceholder('Seleccione una fecha').first().click();
  await page.selectOption('select.react-datepicker__year-select', '1988');
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  // Otros campos
  await page.fill('input[name="email"]', 'TC17@gmail.com');
  await page.fill('input[name="password"]', '123456');
  await page.fill('input[name="confirmPassword"]', '123456');
  await page.fill('input[name="phone"]', '1123456789');

  // Fecha de ingreso
  await page.getByPlaceholder('Seleccione una fecha').nth(1).click();
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  await page.selectOption('select[name="department"]', { label: 'Tecnología' });
  await page.selectOption('select[name="role_name"]', { value: 'supervisor' });

  await page.click('button:has-text("Guardar Usuario")');

    await page.waitForTimeout(3000); // Esperar a que procese
  await expect(page.getByText(/DNI inválido.*7 u 8 dígitos/i)).toBeVisible();
  await page.waitForTimeout(5000); // Esperar a que procese

});
