import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';
import path from 'path';

test('Empleado pide licencia Accidente de trabajo (27 de mayo con certificado)', async ({ page }) => {
  // Login como empleado
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  // Ir a la sección Licencias
  await page.locator('text=Solicitar Licencia').click();

  // Seleccionar tipo de licencia: Accidente de trabajo (asumo ID = 3)
  await page.selectOption('select[name="licenseTypeId"]', '6');

  // Fecha de inicio y fin: 27 de mayo
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  const currentMonth = new Date().getMonth(); // 0 = enero
  const targetMonth = 4; // mayo
  for (let i = 0; i < targetMonth - currentMonth; i++) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator('.react-datepicker__day--027:not(.react-datepicker__day--outside-month)').click();

  await page.getByPlaceholder('Seleccione fecha de fin').click();
  for (let i = 0; i < targetMonth - currentMonth; i++) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator('.react-datepicker__day--027:not(.react-datepicker__day--outside-month)').click();

  // Motivo válido
  await page.fill('textarea[name="reason"]', 'Tengo una gripe.');

  await page.check('input[name="declaration"]');

  // Enviar solicitud
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Enviar Solicitud")');

  // Verificar redirección
  await page.waitForURL('http://localhost:5173/licenses');
  await expect(page).toHaveURL('http://localhost:5173/licenses');

});
