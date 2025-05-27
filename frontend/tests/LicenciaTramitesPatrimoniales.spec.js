import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Empleado pide licencia Tramites patrimoniales', async ({ page }) => {
  // Login como empleado
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  // Ir a la sección Licencias
  await page.locator('text=Solicitar Licencia').click();

  // Seleccionar tipo de licencia (Nacimiento de hijo)
  await page.selectOption('select[name="licenseTypeId"]', '5');

  // Fecha de inicio: 27 de mayo
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  // Si hoy no es mayo, avanzar hasta mayo
  const currentMonth = new Date().getMonth(); // 0 = enero
  const targetMonth = 4; // mayo es mes 4 (0-indexado)
  for (let i = 0; i < targetMonth - currentMonth; i++) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator('.react-datepicker__day--030:not(.react-datepicker__day--outside-month)').click();

  // Fecha de fin: 27 de mayo
  await page.getByPlaceholder('Seleccione fecha de fin').click();
  for (let i = 0; i < targetMonth - currentMonth; i++) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator('.react-datepicker__day--030:not(.react-datepicker__day--outside-month)').click();

  // Motivo
  await page.fill('textarea[name="reason"]', 'Tramite patrimoniales.');

  // Marcar el checkbox
  await page.check('input[name="declaration"]');

  // Enviar solicitud
  await page.waitForTimeout(3000);
  await page.click('button:has-text("Enviar Solicitud")');

  // Verificar redirección
  await page.waitForURL('http://localhost:5173/licenses');
  await expect(page).toHaveURL('http://localhost:5173/licenses');

  // Verificar cartel de éxito
  const successMsg = page.locator('text=Éxito! Tu licencia ha sido creada');
  await expect(successMsg).toBeVisible();
});
