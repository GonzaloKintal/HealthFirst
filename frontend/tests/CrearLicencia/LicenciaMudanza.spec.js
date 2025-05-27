import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Mudanza: fecha de inicio y fin para mañana dinámicamente', async ({ page }) => {
  // Login
  await login(page, 'empleado@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/employee');

  await page.locator('text=Solicitar Licencia').click();
  await page.selectOption('select[name="licenseTypeId"]', '15'); // Mudanza

  // Función para seleccionar mañana en un datepicker abierto
  const selectTomorrow = async () => {
    // Obtener todos los días visibles del mes
    const days = page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)');
    const count = await days.count();

    // Encontrar el índice del día con clase "--today"
    let todayIndex = -1;
    for (let i = 0; i < count; i++) {
      if (await days.nth(i).evaluate(el => el.classList.contains('react-datepicker__day--today'))) {
        todayIndex = i;
        break;
      }
    }
    if (todayIndex === -1 || todayIndex + 1 >= count) {
      throw new Error('No pude encontrar mañana en el calendario');
    }
    // Clic en el siguiente día
    await days.nth(todayIndex + 1).click();
  };

  // Fecha de inicio: mañana
  await page.getByPlaceholder('Seleccione fecha de inicio').click();
  await selectTomorrow();

  // Fecha de fin: mañana
  await page.getByPlaceholder('Seleccione fecha de fin').click();
  await selectTomorrow();

  // Resto del formulario
  await page.fill('textarea[name="reason"]', 'Necesito cambiar de domicilio este mismo día.');
  await page.check('input[name="declaration"]');
  await page.click('button:has-text("Enviar Solicitud")');

  // Verificar redirección
  await page.waitForURL('http://localhost:5173/licenses');
  await expect(page).toHaveURL('http://localhost:5173/licenses');
  
});
