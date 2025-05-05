// test/licencia.spec.js
import { test, expect } from '@playwright/test';

test('Usuario solicita una licencia correctamente', async ({ page }) => {
  // Paso 1: Loguearse usando la función login importada
  await page.goto('http://localhost:5173/login');

  // Ingresar credenciales válidas
  await page.fill('#username', 'cliente@gmail.com');
  await page.fill('#password', '1234');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:5173/employee', { timeout: 10000 });


  // Paso 2: Navegar a la página de solicitud de licencia
  await page.click('span.ml-3.font-medium:text("Solicitar Licencia")');


  // Paso 3: Completar los campos del formulario
  await page.selectOption('select[name="licenseType"]', { value: 'Enfermedad' });
  await page.fill('[name="startDate"]', '2025-05-10');
  await page.fill('[name="endDate"]', '2025-05-11');
  await page.type('textarea[name="reason"]', 'Gripe con fiebre alta');  // Simula que el usuario escribe
  await page.check('input[name="declaration"]');


  // Paso 4: Enviar el formulario
  await page.click('button[type="submit"]');

});
