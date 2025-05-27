import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Reunion Gremial', async ({ page }) => {
  // Login
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  await page.locator('text=Solicitar Licencia').click();
  await page.selectOption('select[name="licenseTypeId"]', '19'); // Mudanza

  // Función para seleccionar pasado mañana en el datepicker
  const selectInTwoDays = async () => {
    const days = page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)');
    const count = await days.count();

    let todayIndex = -1;
    for (let i = 0; i < count; i++) {
      if (await days.nth(i).evaluate(el => el.classList.contains('react-datepicker__day--today'))) {
        todayIndex = i;
        break;
      }
    }

    if (todayIndex === -1 || todayIndex + 3 >= count) {
      throw new Error('No pude encontrar la fecha en el calendario');
    }

    // Clic en el día dos días después de hoy
    await days.nth(todayIndex + 2).click();
  };

  // Fecha de inicio: pasado mañana
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  await selectInTwoDays();

  // Fecha de fin: pasado mañana
  await page.getByPlaceholder('Seleccione fecha de fin').click();
  await selectInTwoDays();

  // Resto del formulario
  await page.fill('textarea[name="reason"]', 'Debo asistir a una reunion gremial.');
  await page.check('input[name="declaration"]');
  await page.click('button:has-text("Enviar Solicitud")');

  // Verificar redirección
  await page.waitForURL('http://localhost:5173/licenses');
  await expect(page).toHaveURL('http://localhost:5173/licenses');
});
