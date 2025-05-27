import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Empleado pide licencia por casamiento de hijo con preaviso de 7 días', async ({ page }) => {
  // Login como empleado
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  // Ir a la sección Licencias
  await page.locator('text=Solicitar Licencia').click();

  // Seleccionar tipo de licencia (asumo que ID = 7 es "Casamiento de hijo")
  await page.selectOption('select[name="licenseTypeId"]', '7');

  // Calcular fecha de inicio y fin (al menos 7 días después de hoy)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 7); // 7 días de preaviso
  const endDate = new Date(startDate); // asumimos 1 solo día
  const startDay = String(startDate.getDate()).padStart(2, '0');
  const endDay = String(endDate.getDate()).padStart(2, '0');
  const currentMonth = today.getMonth();
  const startMonth = startDate.getMonth();

  // Fecha de inicio
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  for (let i = 0; i < startMonth - currentMonth; i++) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator(`.react-datepicker__day--0${startDay}:not(.react-datepicker__day--outside-month)`).click();

  // Fecha de fin (misma que la de inicio)
  await page.getByPlaceholder('Seleccione fecha de fin').click();
  for (let i = 0; i < startMonth - currentMonth; i++) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator(`.react-datepicker__day--0${endDay}:not(.react-datepicker__day--outside-month)`).click();

  // Motivo
  await page.fill('textarea[name="reason"]', 'Mi hijo se casa y solicito la licencia correspondiente.');

  // Declaración jurada
  await page.check('input[name="declaration"]');

  // Enviar solicitud
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Enviar Solicitud")');

  // Verificar redirección y éxito
  await page.waitForURL('http://localhost:5173/licenses');
  await expect(page).toHaveURL('http://localhost:5173/licenses');

});
