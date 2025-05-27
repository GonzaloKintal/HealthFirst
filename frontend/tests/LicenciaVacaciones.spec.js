import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Empleado pide licencia Nacimiento de hijo 2 dias', async ({ page }) => {
  // Login como empleado
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  // Ir a la sección Licencias
  await page.locator('text=Solicitar Licencia').click();

  // Seleccionar tipo de licencia (por ejemplo, Nacimiento de hijo)
  await page.selectOption('select[name="licenseTypeId"]', '1');

  // Fecha de inicio: 2 de junio
await page.getByPlaceholder('Seleccione fecha de inicio').click();
await page.locator('.react-datepicker__navigation--next').click(); // Ir a junio
await page.locator('.react-datepicker__day--002:not(.react-datepicker__day--outside-month)').click();

// Fecha de fin: 9 de junio
await page.getByPlaceholder('Seleccione fecha de fin').click();
await page.locator('.react-datepicker__navigation--next').click(); // Ir a junio
await page.locator('.react-datepicker__day--009:not(.react-datepicker__day--outside-month)').click();


  // Motivo
  await page.fill('textarea[name="reason"]', 'Motivo de la solicitud: vacaciones familiares.');

  // Marcar el checkbox de declaración
  await page.check('input[name="declaration"]');

  // Enviar solicitud
  await page.click('button:has-text("Enviar Solicitud")');

  await page.waitForTimeout(5000);
  // Verificar que se muestre el mensaje de éxito   
});
