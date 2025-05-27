import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Crear usuario no válido  (Teléfono de 16 digítos ) )', async ({ page }) => {
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
  await page.fill('input[name="email"]', 'TC24@gmail.com');
  await page.fill('input[name="password"]', '123456');
  await page.fill('input[name="confirmPassword"]', '123456');
  await page.fill('input[name="phone"]', '1234567891011121'); 

  // Fecha de ingreso
  await page.getByPlaceholder('Seleccione una fecha').nth(1).click();
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  await page.selectOption('select[name="department"]', { label: 'Tecnología' });
  await page.selectOption('select[name="role_name"]', { value: 'supervisor' });
  // Intentar guardar
  // Validación personalizada del campo teléfono vacío o inválido
await page.click('button:has-text("Guardar Usuario")');

await page.waitForTimeout(3000); // Espera para que se procese la validación
const mensajeError = page.getByText(/teléfono inválido.*10.*15/i);
await expect(mensajeError).toBeVisible();
});

