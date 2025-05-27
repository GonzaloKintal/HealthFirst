import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('""Crear usuario no válido(Correo al que le falta el grupo de caracteres despues del . en el TLD )"" )', async ({ page }) => {
  await login(page, 'admin@admin.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/admin');

  // Ir a sección Usuarios
  await page.getByText('Usuarios', { exact: true }).click();

  // Crear nuevo usuario
  await page.click('text=Nuevo Usuario');

  await page.fill('input[name="first_name"]', 'Laura');
  await page.fill('input[name="last_name"]', 'González');

  const randomDNI = Math.floor(10000000 + Math.random() * 90000000).toString();
  await page.fill('input[name="dni"]', randomDNI);

  // Fecha de nacimiento
  await page.getByPlaceholder('Seleccione una fecha').first().click();
  await page.selectOption('select.react-datepicker__year-select', '2000');
  await page.locator('.react-datepicker__day--027:not(.react-datepicker__day--outside-month)').click();

  // Otros campos
  await page.fill('input[name="email"]', 'TC32@.');
  await page.fill('input[name="password"]', '123456');
  await page.fill('input[name="confirmPassword"]', '123456');
  await page.fill('input[name="phone"]', '12345678910'); // Teléfono vacío

  // Fecha de ingreso
  await page.getByPlaceholder('Seleccione una fecha').nth(1).click();
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  await page.selectOption('select[name="department"]', { label: 'Tecnología' });
  await page.selectOption('select[name="role_name"]', { value: 'supervisor' });

const emailInput = page.locator('input[name="email"]');

await page.click('button:has-text("Guardar Usuario")');

// Esperar a que se aplique la clase de error
await expect(emailInput).toHaveClass(/border-red-500/);

await page.waitForTimeout(3000); // Espera para que se procese la validación

});
