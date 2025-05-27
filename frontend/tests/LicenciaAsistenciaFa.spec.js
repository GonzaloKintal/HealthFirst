import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Empleado pide licencia por asistencia a familiares', async ({ page }) => {
  // Login como empleado
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  // Ir a la sección Licencias
  await page.locator('text=Solicitar Licencia').click();

  // Seleccionar tipo de licencia: Asistencia a familiares (asumo ID = 8)
  await page.selectOption('select[name="licenseTypeId"]', '8');

  // Usamos fecha de hoy para inicio y mañana para fin
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDay = (date) => String(date.getDate()).padStart(2, '0');
  const startDay = formatDay(today);
  const endDay = formatDay(tomorrow);

  const currentMonth = today.getMonth();
  const endMonth = tomorrow.getMonth();

  // Fecha de inicio
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  await page.locator(`.react-datepicker__day--0${startDay}:not(.react-datepicker__day--outside-month)`).click();

  // Fecha de fin
  await page.getByPlaceholder('Seleccione fecha de fin').click();
  if (endMonth > currentMonth) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator(`.react-datepicker__day--0${endDay}:not(.react-datepicker__day--outside-month)`).click();

  // Motivo
  await page.fill('textarea[name="reason"]', 'Debo cuidar a un familiar enfermo.');

  // Declaración jurada
  await page.check('input[name="declaration"]');

  // Enviar solicitud
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Enviar Solicitud")');

  // Verificar redirección y mensaje de éxito
  await page.waitForURL('http://localhost:5173/licenses');
  await expect(page).toHaveURL('http://localhost:5173/licenses');

});
