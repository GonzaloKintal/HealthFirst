import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('se crea un usuario no válido dejando el nombre vacío', async ({ page }) => {
  await login(page, 'admin@admin.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/admin');

  // Ir a sección Usuarios
  await page.locator('span.ml-3.font-medium', { hasText: 'Usuarios' }).click();

  // Crear nuevo usuario
  await page.click('text=Nuevo Usuario');

  // Completar formulario (nombre vacío)
  await page.fill('input[name="first_name"]', '');
  await page.fill('input[name="last_name"]', 'flores');

  const randomDNI = Math.floor(10000000 + Math.random() * 90000000).toString();
  await page.fill('input[name="dni"]', randomDNI);

  // Fecha de nacimiento
  await page.getByPlaceholder('Seleccione una fecha').first().click();
  await page.click('.react-datepicker__year-dropdown-container--select');
  await page.selectOption('select.react-datepicker__year-select', '1988');
  await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

  // Otros campos
  await page.fill('input[name="email"]', 'empleado3@gmail.com');
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

  // Validar que el campo nombre es inválido (HTML5)
  const isValid = await page.$eval('input[name="first_name"]', el => el.checkValidity());
  expect(isValid).toBe(false);

  // También podés verificar el mensaje del navegador (opcional)
  const message = await page.$eval('input[name="first_name"]', el => el.validationMessage);
  console.log('Mensaje del navegador:', message);
  await page.waitForTimeout(3000); // espera 3 segundos

});
