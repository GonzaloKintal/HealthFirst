import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Empleado pide licencia por Duelo (A) — solo mañana', async ({ page }) => {
  // Login como empleado
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  // Ir a la sección Licencias
  await page.locator('text=Solicitar Licencia').click();

  // Seleccionar tipo de licencia: Duelo (A) (asumo ID = 12)
  await page.selectOption('select[name="licenseTypeId"]', '12');

  // Calcular mañana
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
    const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');

  const currentMonth = today.getMonth();
  const tomorrowMonth = tomorrow.getMonth();

  // Fecha de inicio (mañana)
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  if (tomorrowMonth > currentMonth) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator(`.react-datepicker__day--0${tomorrowDay}:not(.react-datepicker__day--outside-month)`).click();

  // Fecha de fin (misma mañana)
  await page.getByPlaceholder('Seleccione fecha de fin').click();
  if (tomorrowMonth > currentMonth) {
    await page.locator('.react-datepicker__navigation--next').click();
  }
  await page.locator(`.react-datepicker__day--0${tomorrowDay}:not(.react-datepicker__day--outside-month)`).click();

  // Motivo
  await page.fill('textarea[name="reason"]', 'Duelo familiar cercano.');

  // Declaración jurada
  await page.check('input[name="declaration"]');

  // Enviar solicitud
  await page.click('button:has-text("Enviar Solicitud")');

  // Verificar redirección a listado de licencias
  await page.waitForURL('http://localhost:5173/licenses');
  await expect(page).toHaveURL('http://localhost:5173/licenses');
});
