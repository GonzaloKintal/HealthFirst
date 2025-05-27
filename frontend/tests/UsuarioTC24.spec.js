import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Crear usuario no válido (Teléfono vacío)', async ({ page }) => {
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
  await page.fill('input[name="phone"]', ''); // Teléfono vacío

  // Fecha de ingreso
  await page.getByPlaceholder('Seleccione una fecha').nth(1).click();
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  await page.selectOption('select[name="department"]', { label: 'Tecnología' });
  await page.selectOption('select[name="role_name"]', { value: 'supervisor' });

  // Intentar guardar
  await page.click('button:has-text("Guardar Usuario")');

  // Validar que el campo teléfono es inválido (HTML5)
  const isValid = await page.$eval('input[name="phone"]', el => el.checkValidity());
  expect(isValid).toBe(false);

  // Capturar y mostrar mensaje del navegador (opcional, útil para depurar)
  const validationMessage = await page.$eval('input[name="phone"]', el => el.validationMessage);
  console.log('Mensaje del navegador:', validationMessage);

  // Verificar que el mensaje contiene algo tipo "complete este campo"
  expect(validationMessage).toMatch(/Completa este campo/i);

  await page.waitForTimeout(3000);
});

