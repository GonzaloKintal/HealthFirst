import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Empleado pide licencia por maternidad', async ({ page }) => {
  // Login como empleado
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  // Ir a la sección Licencias
  await page.locator('text=Solicitar Licencia').click();

  // Seleccionar tipo de licencia (por ejemplo, Nacimiento de hijo)
  await page.selectOption('select[name="licenseTypeId"]', '4');

  // Fecha de inicio: hoy (29 de mayo   )
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  await page.locator('.react-datepicker__day--today:not(.react-datepicker__day--outside-month)').click();

  // Fecha de fin: 30 de junio
  await page.getByPlaceholder('Seleccione fecha de fin').click();
  await page.locator('.react-datepicker__day--030:not(.react-datepicker__day--outside-month)').click();

  // Motivo
  await page.fill('textarea[name="reason"]', 'Final de ingles.');

  // Marcar el checkbox de declaración
  await page.check('input[name="declaration"]');

  // Enviar solicitud
  await page.click('button:has-text("Enviar Solicitud")');

  await page.waitForTimeout(3000);
  
// Verificar que redirige a la URL esperada
  await expect(page).toHaveURL('http://localhost:5173/licenses');

});
